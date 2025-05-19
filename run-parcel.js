// run-parcel.js
const { execSync } = require('child_process');
require('dotenv').config();

const mode = process.argv[2] || 'serve'; // 'serve', 'build:lib', or 'build:demo'
const buildDir = process.argv[3] || 'build';



// Read the public path from the environment variable set in your .env file.
// This variable (PARCEL_APP_BASE_PATH) is also used by your corrected_fetch_logic_js.
const publicUrl = process.env.PUBLIC_URL;

if ((mode === 'build' || mode === 'serve') && !publicUrl) {
  console.error(
    '[run-parcel.js] ❌ PUBLIC_URL must be defined in your .env file or shell environment.'
  );
  process.exit(1);
}

let parcelCommand = '';

switch (mode) {
  case 'build:lib':
    parcelCommand = `parcel build src/index.ts --dist-dir dist --no-cache`;
    break;
  case 'build':
    parcelCommand = `parcel build public/index.html --public-url "${publicUrl}" --dist-dir ${buildDir} --no-cache`;
    break;
  case 'serve':
    parcelCommand = `parcel public/index.html --public-url "${publicUrl}" --no-cache`;
    break;
  default:
    console.error(`[run-parcel.js] ❌ Unknown mode: ${mode}`);
    process.exit(1);
}

console.log(`[run-parcel.js] ▶ Running: ${parcelCommand}`);
execSync(parcelCommand, { stdio: 'inherit' });