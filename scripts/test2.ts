import { dbQuery } from './server/database/pool.ts';

async function main() {
  const p = await dbQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'passengers'");
  console.log("Passengers:", p.rows);
  process.exit(0);
}
main();
