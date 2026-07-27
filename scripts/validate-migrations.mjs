import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const schema = fs.readFileSync(path.join(root, 'src', 'db', 'schema.ts'), 'utf8');
const expected = [...schema.matchAll(/mysqlTable\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
const migrationSql = fs.readdirSync(path.join(root, 'drizzle'))
  .filter((file) => /^\d+.*\.sql$/i.test(file))
  .sort()
  .map((file) => fs.readFileSync(path.join(root, 'drizzle', file), 'utf8'))
  .join('\n');
const migrated = [...migrationSql.matchAll(/CREATE TABLE `([^`]+)`/gi)].map((match) => match[1]);
const missing = expected.filter((table) => !migrated.includes(table));
const unknown = migrated.filter((table) => !expected.includes(table));
const identifiers = [...migrationSql.matchAll(/(?:CONSTRAINT|INDEX)\s+`([^`]+)`/gi)]
  .map((match) => match[1]);
const oversizedIdentifiers = [...new Set(identifiers.filter((identifier) => identifier.length > 64))];

const result = {
  schemaTables: expected.length,
  migrationTables: migrated.length,
  missing,
  unknown,
  oversizedIdentifiers,
  ready: missing.length === 0
    && unknown.length === 0
    && oversizedIdentifiers.length === 0
    && new Set(migrated).size === migrated.length,
};

console.log(JSON.stringify(result, null, 2));
if (!result.ready) process.exitCode = 1;
