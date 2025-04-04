// scripts/copy-headers.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get equivalent of __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy _headers file to build directory
try {
  fs.copyFileSync(
    path.resolve(__dirname, '../_headers'),
    path.resolve(__dirname, '../dist/_headers')
  );
  console.log('Successfully copied _headers file to dist directory');
} catch (error) {
  console.error('Error copying _headers file:', error);
  process.exit(1);
}
