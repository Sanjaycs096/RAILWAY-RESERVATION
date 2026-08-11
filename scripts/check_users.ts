import { dbQuery } from '../server/database/pool';

async function checkUsers() {
  const res = await dbQuery('SELECT email, role, password_hash FROM users');
  console.log(res.rows);
  process.exit(0);
}
checkUsers();
