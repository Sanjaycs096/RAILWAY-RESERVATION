import { dbQuery } from './server/database/pool';

async function clearDb() {
  console.log('🧹 Clearing old mock data to prevent conflicts...');
  try {
    await dbQuery('TRUNCATE TABLE route_stops, train_fares, trains CASCADE;');
    console.log('✅ Old trains and routes cleared safely!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to clear DB:', err);
    process.exit(1);
  }
}

clearDb();
