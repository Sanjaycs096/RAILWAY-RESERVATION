import { dbQuery } from './server/database/pool.ts';

async function main() {
  const b = await dbQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings'");
  const p = await dbQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payments'");
  console.log("Bookings:", b.rows);
  console.log("Payments:", p.rows);
  process.exit(0);
}
main();
