/**
 * Create or reset the admin user.
 *
 * Unlike the catalogue seed (which leaves an existing account untouched), this
 * script is idempotent and authoritative for the admin:
 *   - If the email doesn't exist  -> creates a new admin.
 *   - If the email already exists  -> promotes it to admin AND resets its password.
 *
 * Usage (run from the `server` folder):
 *   npm run create-admin                          # uses SEED_ADMIN_* from .env (or defaults)
 *   npm run create-admin -- you@email.com Secret1  # explicit email + password
 *
 * Defaults: admin@flavorhub.test / Admin@12345
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const log = (...a) => console.log('[create-admin]', ...a); // eslint-disable-line no-console

const run = async () => {
  const email = (process.argv[2] || env.seed.adminEmail).toLowerCase().trim();
  const password = process.argv[3] || env.seed.adminPassword;

  if (!password || password.length < 8) {
    console.error('[create-admin] Password must be at least 8 characters.'); // eslint-disable-line no-console
    process.exitCode = 1;
    return;
  }

  try {
    await connectDB();

    let user = await User.findOne({ email });
    if (user) {
      user.role = 'admin';
      user.password = password; // re-hashed by the model's pre-save hook
      await user.save();
      log(`Existing user "${email}" promoted to admin and password reset.`);
    } else {
      user = await User.create({ name: 'Flavor Hub Admin', email, password, role: 'admin' });
      log(`Created new admin "${email}".`);
    }

    log('You can now log in with:');
    log(`  email:    ${email}`);
    log(`  password: ${password}`);
  } catch (err) {
    console.error('[create-admin] Failed:', err.message); // eslint-disable-line no-console
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
