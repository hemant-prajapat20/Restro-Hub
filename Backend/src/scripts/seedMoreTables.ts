import mongoose from 'mongoose';
import Business from '../models/Business';
import Table from '../models/Table';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const NEW_TABLES = [
  // Ground Floor (Floor 1)
  { number: 'G-11', capacity: 2, floor: 1 },
  { number: 'G-12', capacity: 4, floor: 1 },
  { number: 'G-13', capacity: 4, floor: 1 },
  { number: 'G-14', capacity: 6, floor: 1 },
  { number: 'G-15', capacity: 8, floor: 1 },
  
  // Rooftop / Terrace (Floor 2)
  { number: 'R-11', capacity: 2, floor: 2 },
  { number: 'R-12', capacity: 2, floor: 2 },
  { number: 'R-13', capacity: 4, floor: 2 },
  { number: 'R-14', capacity: 4, floor: 2 },
  { number: 'R-15', capacity: 8, floor: 2 }
];

const seedAdditionalTables = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found. Run the main seeder first.');
      process.exit(1);
    }
    
    console.log('Seeding additional tables...');
    for (const tableData of NEW_TABLES) {
      // Check if table already exists to avoid duplicates
      const existing = await Table.findOne({ businessId: business._id, number: tableData.number });
      if (!existing) {
        await Table.create({ ...tableData, businessId: business._id });
        console.log(`Created table ${tableData.number}`);
      } else {
        console.log(`Table ${tableData.number} already exists, skipping.`);
      }
    }

    console.log('Successfully seeded additional tables!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdditionalTables();
