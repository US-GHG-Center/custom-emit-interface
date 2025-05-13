// run-parcel.js
const { execSync } = require('child_process');

// dotenv-cli (used in package.json) should load the .env file before this script runs.
// If you were running this script directly without dotenv-cli, you'd uncomment the next line:
// require('dotenv').config(); 

const scriptArg = process.argv[2] || 'serve'; // Expect 'serve' or 'build' as an argument

// Read the public path from the environment variable set in your .env file.
// This variable (PARCEL_APP_BASE_PATH) is also used by your corrected_fetch_logic_js.
const publicUrl = process.env.PUBLIC_URL;

if (!publicUrl) {
  console.error(
    'Error: PARCEL_APP_BASE_PATH is not defined in your .env file or environment.',
  );
  console.error(
    'Please define it (e.g., PARCEL_APP_BASE_PATH="/my/custom/path").',
  );
  process.exit(1);
}

let parcelCommand;

// Construct the appropriate Parcel command based on the argument
if (scriptArg === 'build') {
  parcelCommand = `parcel build public/index.html --public-url "${publicUrl}"`;
} else { // Default to 'serve' for starting the dev server
  parcelCommand = `parcel public/index.html --public-url "${publicUrl}"`;
}

console.log(`[run-parcel.js] Using public URL: ${publicUrl}`);
console.log(`[run-parcel.js] Executing command: ${parcelCommand}`);

try {
  // Execute the Parcel command. stdio: 'inherit' ensures output is piped to the console.
  execSync(parcelCommand, { stdio: 'inherit' });
} catch (error) {
  // execSync throws an error if the command exits with a non-zero code.
  // The actual error message from Parcel will have already been printed.
  console.error(`[run-parcel.js] Parcel command failed.`);
  process.exit(1); // Exit with an error code
}
