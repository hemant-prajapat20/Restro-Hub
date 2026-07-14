import mongoose from 'mongoose';
import Business from '../models/Business';
import Table from '../models/Table';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const strictFixTableNames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    
    const groundTables = await Table.find({ floor: 1 }).sort({ createdAt: 1 });
    const roofTables = await Table.find({ floor: 2 }).sort({ createdAt: 1 });

    console.log(`Found ${groundTables.length} Ground tables and ${roofTables.length} Rooftop tables.`);

    let gIndex = 1;
    for (const table of groundTables) {
      const newName = `G-${gIndex.toString().padStart(2, '0')}`;
      console.log(`Renaming ${table.number} -> ${newName}`);
      table.number = newName;
      await table.save();
      gIndex++;
    }

    let rIndex = 1;
    for (const table of roofTables) {
      const newName = `R-${rIndex.toString().padStart(2, '0')}`;
      console.log(`Renaming ${table.number} -> ${newName}`);
      table.number = newName;
      await table.save();
      rIndex++;
    }

    console.log('Successfully enforced strict table naming pattern!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

strictFixTableNames();
