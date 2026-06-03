import path from 'node:path';
import dotenv from 'dotenv';

// Vercel compiles standalone functions from ESM to CommonJS. Using process.cwd()
// avoids import.meta/url handling differences during runtime initialization.
dotenv.config({ path: path.resolve(process.cwd(), 'api/.env') });
