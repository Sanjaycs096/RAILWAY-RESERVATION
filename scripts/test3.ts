import { dbQuery } from '../server/database/pool.ts';

async function main() {
  try {
    const p = await dbQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'route_stops'");
    console.log("route_stops columns:", p.rows);
    const s = await dbQuery("SELECT * FROM route_stops LIMIT 5");
    console.log("route_stops data:", s.rows);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
main();
