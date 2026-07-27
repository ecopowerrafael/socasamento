import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('drizzle');
const destination = path.resolve('dist', 'drizzle');
fs.mkdirSync(destination, { recursive: true });
fs.cpSync(source, destination, { recursive: true, force: true });
