import 'dotenv/config';
import { auditMysqlSchema, ensureCompleteMysqlSchema } from '../src/db/schemaBootstrap.ts';
import { getMysqlPool, testConnection } from '../src/db/index.ts';
import { seedDatabase } from '../src/db/seed.ts';

async function main() {
  const connection = await testConnection();
  if (!connection.success) throw new Error(connection.message);

  const bootstrap = await ensureCompleteMysqlSchema();
  await seedDatabase();
  const audit = await auditMysqlSchema();

  console.log(JSON.stringify({ bootstrap, audit }, null, 2));
  if (!audit.ready) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getMysqlPool().end();
  });
