/**
 * Creates server/.env and client/.env from the .env.example files (only if missing)
 * and generates a random JWT secret, so you never have to edit anything to run locally.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');

function ensureEnv(folder, transform = (text) => text) {
  const example = path.join(root, folder, '.env.example');
  const target = path.join(root, folder, '.env');
  if (fs.existsSync(target)) {
    console.log(`[setup] ${folder}/.env already exists - left unchanged`);
    return;
  }
  fs.writeFileSync(target, transform(fs.readFileSync(example, 'utf8')));
  console.log(`[setup] created ${folder}/.env`);
}

ensureEnv('server', (text) =>
  text.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${crypto.randomBytes(48).toString('hex')}`)
);
ensureEnv('client');

console.log('\n[setup] Done. Make sure MongoDB is running, then start the app with:  npm run dev\n');
