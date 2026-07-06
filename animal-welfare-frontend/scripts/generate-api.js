import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import http from 'http';

const API_DOCS_URL = 'http://localhost:8080/api-docs';
const OUTPUT_DIR = path.resolve('src/types/generated');
const JSON_OUTPUT = path.join(OUTPUT_DIR, 'openapi.json');
const TS_OUTPUT = path.join(OUTPUT_DIR, 'schema.ts');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log(`Attempting to fetch OpenAPI spec from ${API_DOCS_URL}...`);

const fetchSpec = () => {
  return new Promise((resolve, reject) => {
    http.get(API_DOCS_URL, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch: Status code ${res.statusCode}`));
        return;
      }
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

try {
  const spec = await fetchSpec();
  fs.writeFileSync(JSON_OUTPUT, JSON.stringify(spec, null, 2));
  console.log(`Saved local OpenAPI schema to ${JSON_OUTPUT}`);
} catch (error) {
  console.warn(`WARNING: Could not fetch schema from backend (${error.message}).`);
  if (fs.existsSync(JSON_OUTPUT)) {
    console.log(`Using existing cached openapi.json file for generation...`);
  } else {
    console.error(`ERROR: No cached openapi.json found. Backend must be running for first generation.`);
    process.exit(1);
  }
}

// Run openapi-typescript
try {
  console.log(`Generating TypeScript interfaces to ${TS_OUTPUT}...`);
  execSync(`npx openapi-typescript "${JSON_OUTPUT}" -o "${TS_OUTPUT}"`, { stdio: 'inherit' });
  console.log('✓ Successfully generated OpenAPI TypeScript clients.');
} catch (err) {
  console.error('Failed to generate TypeScript client: ', err.message);
  process.exit(1);
}
