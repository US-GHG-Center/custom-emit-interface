// run-parcel.js
const { execSync } = require('child_process');
// No longer strictly need to load .env here if publicUrl comes from package.json targets,
// but it doesn't hurt if other scripts or parts of your app use process.env.PUBLIC_URL.
require('dotenv').config();

const mode = process.argv[2] || 'serve'; // 'serve', 'build:lib', or 'build' (for app)
// The 'buildDir' argument is no longer used as distDir comes from package.json targets.

let parcelCommand = '';

switch (mode) {
  case 'build:lib':
    parcelCommand = `parcel build --target library --no-cache`;
    break;
  case 'build': // Builds the 'app' target defined in package.json
    parcelCommand = `parcel build --target app`;
    break;
  case 'serve': // Serves the 'app' target defined in package.json
    // The 'app' target in package.json should have publicUrl defined.
    // Parcel's serve command will use that.
    parcelCommand = `parcel serve --target app`;
    break;
  default:
    console.error(`[run-parcel.js] ❌ Unknown mode: ${mode}`);
    process.exit(1);
}

console.log(`[run-parcel.js] ▶ Running: ${parcelCommand}`);
try {
  execSync(parcelCommand, { stdio: 'inherit' });
} catch (error) {
  console.error(`[run-parcel.js] ❌ Parcel command failed for mode: ${mode}`);
  // error object itself is already printed by execSync on failure when stdio is 'inherit'
  process.exit(1); // Ensure script exits with error code
}