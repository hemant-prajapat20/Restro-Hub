import mongoose from 'mongoose';
import Business from '../models/Business';
import Table from '../models/Table';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixTableNames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    const tables = await Table.find().sort({ floor: 1, createdAt: 1 });
    
    console.log(`Found ${tables.length} tables to evaluate for renaming...`);

    let gCounter = 1;
    let rCounter = 1;

    for (const table of tables) {
      let currentNumber = table.number;
      let newNumber = currentNumber;

      // If it doesn't already match the pattern "G-X" or "R-X"
      if (!currentNumber.startsWith('G-') && !currentNumber.startsWith('R-') && !currentNumber.startsWith('T-')) {
        if (table.floor === 1) {
          // It's on the ground floor
          // Check if the current name is a plain number or generic
          newNumber = `G-${currentNumber.padStart(2, '0')}`;
        } else if (table.floor === 2) {
          // It's on the rooftop
          newNumber = `R-${currentNumber.padStart(2, '0')}`;
        }
        
        // Ensure no collisions
        const exists = await Table.findOne({ businessId: table.businessId, number: newNumber, _id: { $ne: table._id } });
        if (exists) {
          // If collision, append a letter or increment differently
          newNumber = `${newNumber}-A`;
        }

        table.number = newNumber;
        await table.save();
        console.log(`Renamed table ID ${table._id} from '${currentNumber}' to '${newNumber}'`);
      }
    }

    console.log('Successfully standardized all table names!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

fixTableNames();
