import { dbQuery } from './server/database/pool';
import bcrypt from 'bcryptjs';

async function seedDemoUsers() {
  const adminHash = bcrypt.hashSync('AdminPass123!', 10);
  const passHash = bcrypt.hashSync('Passenger123!', 10);
  
  await dbQuery(`
    INSERT INTO users (id, name, email, role, phone, password_hash, status, preferences) 
    VALUES 
    ('usr_admin_demo', 'System Admin', 'admin@railway.gov', 'admin', '9999999999', $1, 'active', '{"notifications":true,"darkMode":true,"preferredClass":"1A"}'),
    ('usr_pass_demo', 'John Passenger', 'passenger@railway.com', 'passenger', '8888888888', $2, 'active', '{"notifications":true,"darkMode":false,"preferredClass":"3A"}')
    ON CONFLICT (email) DO NOTHING;
  `, [adminHash, passHash]);
  
  console.log('✅ Demo users seeded successfully!');
  process.exit(0);
}
seedDemoUsers();
