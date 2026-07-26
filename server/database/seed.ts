import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { dbQuery } from './pool';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  console.log('🚀 Starting Database Seeding...');
  try {
    // 1. Run Schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await dbQuery(schemaSql);
    console.log('✅ Schema executed successfully.');

    // 2. Check if admin exists
    const adminCheck = await dbQuery('SELECT id FROM users WHERE email = $1', ['admin@railway.gov']);
    if (adminCheck.rowCount === 0) {
      const hash = await bcrypt.hash('123@Admin', 10);
      await dbQuery(
        `INSERT INTO users (id, name, email, role, password_hash, status, preferences) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['usr_admin_001', 'System Admin', 'admin@railway.gov', 'admin', hash, 'active', JSON.stringify({ notifications: true })]
      );
      
      const passHash = await bcrypt.hash('Passenger123!', 10);
      await dbQuery(
        `INSERT INTO users (id, name, email, role, password_hash, status) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['usr_pass_001', 'Sanjay Kumar', 'passenger@railway.com', 'passenger', passHash, 'active']
      );
      console.log('✅ Users seeded.');
    }

    // 3. Seed Stations
    const stations = [
      { code: 'NDLS', name: 'New Delhi Railway Station', city: 'New Delhi', state: 'Delhi', zone: 'NR', lat: 28.6431, lng: 77.2197 },
      { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', zone: 'WR', lat: 18.9696, lng: 72.8193 }
    ];
    for (const s of stations) {
      await dbQuery(
        `INSERT INTO stations (station_code, station_name, city, state, zone, latitude, longitude) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (station_code) DO NOTHING`,
        [s.code, s.name, s.city, s.state, s.zone, s.lat, s.lng]
      );
    }
    console.log('✅ Stations seeded.');

    // 4. Seed Trains
    const coaches = JSON.stringify([
      { type: '1A', name: 'First AC', totalSeats: 24, availableSeats: 8, fare: 2850 },
      { type: '2A', name: 'AC 2-Tier', totalSeats: 48, availableSeats: 15, fare: 2250 }
    ]);
    
    await dbQuery(
      `INSERT INTO trains (train_number, train_name, train_type, zone, source_station_code, destination_station_code, departure_time, arrival_time, total_duration, total_distance_km, runs_on_mon, runs_on_tue, runs_on_wed, runs_on_thu, runs_on_fri, runs_on_sat, runs_on_sun, available_classes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) ON CONFLICT (train_number) DO NOTHING`,
      ['12952', 'Mumbai Rajdhani Express', 'Rajdhani', 'WR', 'NDLS', 'MMCT', '16:55', '08:35', '15 hours 40 minutes', 1384, true, true, true, true, true, true, true, coaches]
    );
    console.log('✅ Trains seeded.');

    console.log('🎉 Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

runSeed();
