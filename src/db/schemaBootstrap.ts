import fs from 'node:fs';
import path from 'node:path';
import type { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { getMysqlPool } from './index.ts';

export interface SchemaAudit {
  expectedTables: number;
  existingTables: number;
  createdTables: string[];
  addedColumns: string[];
  addedConstraints: string[];
}

function findMigrationDirectory() {
  const candidates = [
    path.resolve(process.cwd(), 'drizzle'),
    path.resolve(process.cwd(), 'dist', 'drizzle'),
  ];
  const found = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory());
  if (!found) throw new Error('Migrações ausentes. Esperado: diretório drizzle/');
  return found;
}

function migrationStatements() {
  const directory = findMigrationDirectory();
  return fs.readdirSync(directory)
    .filter((file) => /^\d+.*\.sql$/i.test(file))
    .sort()
    .flatMap((file) => fs.readFileSync(path.join(directory, file), 'utf8')
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter(Boolean));
}

function createTableName(statement: string) {
  return statement.match(/^CREATE TABLE `([^`]+)`/i)?.[1] || null;
}

function createColumns(statement: string) {
  return statement.split(/\r?\n/).slice(1, -1)
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => line.startsWith('`'))
    .map((definition) => ({ name: definition.match(/^`([^`]+)`/)?.[1] || '', definition }))
    .filter((column) => column.name);
}

function createConstraints(statement: string) {
  return statement.split(/\r?\n/)
    .map((line) => line.trim().replace(/,$/, ''))
    .filter((line) => /^CONSTRAINT `[^`]+`/i.test(line))
    .map((definition) => ({
      name: definition.match(/^CONSTRAINT `([^`]+)`/i)?.[1] || '',
      definition,
    }))
    .filter((constraint) => constraint.name);
}

async function tableNames(connection: PoolConnection) {
  const [rows] = await connection.query<RowDataPacket[]>(
    'SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()',
  );
  return new Set(rows.map((row) => String(row.TABLE_NAME)));
}

async function columnNames(connection: PoolConnection, table: string) {
  const [rows] = await connection.query<RowDataPacket[]>(
    'SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [table],
  );
  return new Set(rows.map((row) => String(row.COLUMN_NAME)));
}

async function constraintExists(connection: PoolConnection, name: string) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = ? LIMIT 1`,
    [name],
  );
  return rows.length > 0;
}

async function indexExists(connection: PoolConnection, table: string, name: string) {
  const [rows] = await connection.query<RowDataPacket[]>(
    `SELECT 1 FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1`,
    [table, name],
  );
  return rows.length > 0;
}

/**
 * Completes new and partially-created databases without deleting user data.
 * Only absent tables, columns and named constraints are added.
 */
export async function ensureCompleteMysqlSchema(): Promise<SchemaAudit> {
  const statements = migrationStatements();
  const creates = statements.filter((statement) => /^CREATE TABLE /i.test(statement));
  const alters = statements.filter((statement) => /^ALTER TABLE /i.test(statement));
  const indexes = statements.filter((statement) => /^CREATE (?:UNIQUE )?INDEX /i.test(statement));
  const expected = creates.map(createTableName).filter((name): name is string => Boolean(name));
  const connection = await getMysqlPool().getConnection();
  const audit: SchemaAudit = {
    expectedTables: expected.length,
    existingTables: 0,
    createdTables: [],
    addedColumns: [],
    addedConstraints: [],
  };
  try {
    let existing = await tableNames(connection);
    for (const statement of creates) {
      const table = createTableName(statement)!;
      if (!existing.has(table)) {
        await connection.query(statement.replace(/^CREATE TABLE /i, 'CREATE TABLE IF NOT EXISTS '));
        audit.createdTables.push(table);
      }
    }

    existing = await tableNames(connection);
    for (const statement of creates) {
      const table = createTableName(statement)!;
      const columns = await columnNames(connection, table);
      for (const column of createColumns(statement)) {
        if (!columns.has(column.name)) {
          await connection.query(`ALTER TABLE \`${table}\` ADD COLUMN ${column.definition}`);
          audit.addedColumns.push(`${table}.${column.name}`);
        }
      }
      for (const constraint of createConstraints(statement)) {
        const exists = /PRIMARY KEY/i.test(constraint.definition)
          ? await indexExists(connection, table, 'PRIMARY')
          : await constraintExists(connection, constraint.name);
        if (!exists) {
          await connection.query(`ALTER TABLE \`${table}\` ADD ${constraint.definition}`);
          audit.addedConstraints.push(constraint.name);
        }
      }
    }

    for (const statement of alters) {
      const constraint = statement.match(/ADD CONSTRAINT `([^`]+)`/i)?.[1];
      if (!constraint || await constraintExists(connection, constraint)) continue;
      await connection.query(statement);
      audit.addedConstraints.push(constraint);
    }

    for (const statement of indexes) {
      const parsed = statement.match(/^CREATE (?:UNIQUE )?INDEX `([^`]+)` ON `([^`]+)`/i);
      if (!parsed) continue;
      const [, name, table] = parsed;
      if (!await indexExists(connection, table, name)) {
        await connection.query(statement);
        audit.addedConstraints.push(name);
      }
    }

    const finalTables = await tableNames(connection);
    audit.existingTables = expected.filter((table) => finalTables.has(table)).length;
    const missing = expected.filter((table) => !finalTables.has(table));
    if (missing.length) throw new Error(`Schema MySQL incompleto. Tabelas ausentes: ${missing.join(', ')}`);
    return audit;
  } finally {
    connection.release();
  }
}

export async function auditMysqlSchema() {
  const statements = migrationStatements();
  const creates = statements.filter((statement) => /^CREATE TABLE /i.test(statement));
  const alters = statements.filter((statement) => /^ALTER TABLE /i.test(statement));
  const indexes = statements.filter((statement) => /^CREATE (?:UNIQUE )?INDEX /i.test(statement));
  const connection = await getMysqlPool().getConnection();
  try {
    const existing = await tableNames(connection);
    const missingTables: string[] = [];
    const missingColumns: string[] = [];
    const missingConstraints: string[] = [];
    const missingIndexes: string[] = [];
    for (const statement of creates) {
      const table = createTableName(statement)!;
      if (!existing.has(table)) {
        missingTables.push(table);
        continue;
      }
      const columns = await columnNames(connection, table);
      for (const column of createColumns(statement)) {
        if (!columns.has(column.name)) missingColumns.push(`${table}.${column.name}`);
      }
      for (const constraint of createConstraints(statement)) {
        const exists = /PRIMARY KEY/i.test(constraint.definition)
          ? await indexExists(connection, table, 'PRIMARY')
          : await constraintExists(connection, constraint.name);
        if (!exists) {
          missingConstraints.push(`${table}.${constraint.name}`);
        }
      }
    }
    for (const statement of alters) {
      const constraint = statement.match(/ADD CONSTRAINT `([^`]+)`/i)?.[1];
      if (constraint && !await constraintExists(connection, constraint)) {
        missingConstraints.push(constraint);
      }
    }
    for (const statement of indexes) {
      const parsed = statement.match(/^CREATE (?:UNIQUE )?INDEX `([^`]+)` ON `([^`]+)`/i);
      if (parsed && !await indexExists(connection, parsed[2], parsed[1])) {
        missingIndexes.push(`${parsed[2]}.${parsed[1]}`);
      }
    }
    return {
      expectedTables: creates.length,
      missingTables,
      missingColumns,
      missingConstraints,
      missingIndexes,
      ready: missingTables.length === 0
        && missingColumns.length === 0
        && missingConstraints.length === 0
        && missingIndexes.length === 0,
    };
  } finally {
    connection.release();
  }
}
