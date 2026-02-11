import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: DATABASE_URL not found in .env');
  process.exit(1);
}

const runMigration = async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
  });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();

    console.log('Running migration: Add is_bookmarked to cards table...');
    
    // Check if column exists first to be safe (idempotent)
    // But IF NOT EXISTS syntax is cleaner
    const query = `
      ALTER TABLE cards 
      ADD COLUMN IF NOT EXISTS is_bookmarked BOOLEAN DEFAULT FALSE;
    `;

    await client.query(query);
    
    console.log('✅ Migration successful: is_bookmarked column added.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigration();
