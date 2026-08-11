import fs from 'fs';
import { dbQuery } from '../server/database/pool';

async function executeSqlFile() {
  console.log('⏳ Reading indian_railways_data.sql...');
  try {
    const sql = fs.readFileSync('indian_railways_data.sql', 'utf8');
    
    console.log(`🚀 Executing ${sql.length} characters of SQL...`);
    await dbQuery(sql);
    
    console.log('✅ Successfully inserted all mock data into the live database!');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ SQL Execution Failed:', err.message);
    process.exit(1);
  }
}

executeSqlFile();
