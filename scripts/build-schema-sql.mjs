import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const directory = path.join(root, 'drizzle');
const migrations = fs.readdirSync(directory)
  .filter((file) => /^\d+.*\.sql$/i.test(file))
  .sort();

const sql = [
  '-- Guia Fotógrafo Casamento - schema MySQL completo',
  '-- Gerado a partir das migrações versionadas. Não edite manualmente.',
  '',
  ...migrations.flatMap((file) => [
    `-- ${file}`,
    fs.readFileSync(path.join(directory, file), 'utf8')
      .replaceAll('--> statement-breakpoint', '')
      .trim(),
    '',
  ]),
].join('\n');

fs.writeFileSync(path.join(root, 'schema_mysql.sql'), `${sql.trimEnd()}\n`, 'utf8');
console.log(`schema_mysql.sql gerado com ${migrations.length} migrações.`);
