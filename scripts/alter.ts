import { dbQuery } from './server/database/pool.ts';

async function main() {
  try {
    await dbQuery("ALTER TABLE passengers ALTER COLUMN booking_id TYPE VARCHAR(50)");
    await dbQuery("ALTER TABLE payments ALTER COLUMN booking_id TYPE VARCHAR(50)");
    console.log("Successfully altered tables!");
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
main();
