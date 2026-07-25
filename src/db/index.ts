import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';

const dbHost = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
const dbDatabase = process.env.DB_DATABASE || process.env.MYSQL_DATABASE || 'guia_fotografo_casamento';
const dbUsername = process.env.DB_USERNAME || process.env.DB_USER || process.env.MYSQL_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
const databaseUrl = process.env.DATABASE_URL;

let pool: mysql.Pool | null = null;

export function getPoolConfig() {
  if (databaseUrl && databaseUrl.trim().length > 0) {
    return databaseUrl;
  }
  return {
    host: dbHost,
    port: dbPort,
    user: dbUsername,
    password: dbPassword,
    database: dbDatabase,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
  };
}

export function getMysqlPool(): mysql.Pool {
  if (!pool) {
    const config = getPoolConfig();
    pool = mysql.createPool(config as any);
  }
  return pool;
}

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const currentPool = getMysqlPool();
    const conn = await currentPool.getConnection();
    await conn.ping();
    conn.release();
    const msg = `✅ Conexão com o banco MySQL ("${dbDatabase}" em ${dbHost}:${dbPort}) estabelecida com sucesso!`;
    console.log(msg);
    return { success: true, message: msg };
  } catch (err: any) {
    const errorMsg = `❌ Falha ao conectar ao banco MySQL (${dbHost}:${dbPort}/${dbDatabase}): ${err?.message || err}. Por favor, verifique as variáveis DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD ou DATABASE_URL no arquivo .env`;
    console.error(errorMsg);
    return { success: false, message: errorMsg };
  }
}

// Create drizzle instance
export const db = drizzle(getMysqlPool(), { schema, mode: 'default' });
