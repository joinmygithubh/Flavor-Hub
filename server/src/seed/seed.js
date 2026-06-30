/**
 * Database seeding script.
 *
 *   npm run seed           -> wipes dishes/restaurants, inserts the catalogue,
 *                             and ensures a default admin user exists.
 *   npm run seed:destroy   -> removes all seeded data.
 *
 * Run from the `server` directory with a valid MONGO_URI in your .env.
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { Dish } from '../models/Dish.js';
import { Restaurant } from '../models/Restaurant.js';
import { User } from '../models/User.js';
import { dishesData } from './dishes.data.js';

const log = (...args) => console.log('[seed]', ...args); // eslint-disable-line no-console

const restaurantsData = [
  { name: 'Spice Route Kitchen', cuisines: ['Indian', 'Thai'], rating: 4.6, deliveryFee: 2.99, address: { city: 'Metropolis', area: 'Downtown' } },
  { name: 'Bella Napoli', cuisines: ['Italian', 'Continental'], rating: 4.7, deliveryFee: 2.99, address: { city: 'Metropolis', area: 'Riverside' } },
  { name: 'Street Eats Co.', cuisines: ['Fast Food', 'Mexican', 'African'], rating: 4.4, deliveryFee: 1.99, address: { city: 'Metropolis', area: 'Old Town' } },
  { name: 'Sakura House', cuisines: ['Japanese', 'Chinese'], rating: 4.8, deliveryFee: 3.49, address: { city: 'Metropolis', area: 'Harbor' } },
  { name: 'Cedar & Olive', cuisines: ['Lebanese', 'Continental'], rating: 4.5, deliveryFee: 2.49, address: { city: 'Metropolis', area: 'Garden District' } },
];

// Picks a sensible restaurant for a dish based on cuisine overlap.
const pickRestaurant = (cuisine, restaurants) =>
  restaurants.find((r) => r.cuisines.includes(cuisine)) || restaurants[0];

const destroy = async () => {
  await Promise.all([Dish.deleteMany({}), Restaurant.deleteMany({})]);
  log('Removed all dishes and restaurants.');
};

const importData = async () => {
  await destroy();

  const restaurants = await Restaurant.insertMany(restaurantsData);
  log(`Inserted ${restaurants.length} restaurants.`);

  const dishesToInsert = dishesData.map((dish) => ({
    ...dish,
    restaurant: pickRestaurant(dish.cuisine, restaurants)._id,
  }));
  const dishes = await Dish.insertMany(dishesToInsert);
  log(`Inserted ${dishes.length} dishes across ${new Set(dishes.map((d) => d.cuisine)).size} cuisines.`);

  // Ensure a default admin exists (idempotent).
  const existingAdmin = await User.findOne({ email: env.seed.adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Flavor Hub Admin',
      email: env.seed.adminEmail,
      password: env.seed.adminPassword,
      role: 'admin',
    });
    log(`Created default admin: ${env.seed.adminEmail}`);
  } else {
    log('Admin user already exists, skipping.');
  }
};

const run = async () => {
  try {
    await connectDB();
    if (process.argv.includes('--destroy')) {
      await destroy();
      log('Destroy complete.');
    } else {
      await importData();
      log('Seed complete. Enjoy Flavor Hub!');
    }
  } catch (err) {
    console.error('[seed] Failed:', err); // eslint-disable-line no-console
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
