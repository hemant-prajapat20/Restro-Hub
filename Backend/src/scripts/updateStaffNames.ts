import mongoose from 'mongoose';
import Staff from '../models/Staff';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const UPDATES = [
  {
    oldEmail: 'emma.r@restrohub.com',
    newName: 'Priya Sharma',
    newEmail: 'priya.s@restrohub.com'
  },
  {
    oldEmail: 'michael.c@restrohub.com',
    newName: 'Rahul Desai',
    newEmail: 'rahul.d@restrohub.com'
  },
  {
    oldEmail: 'sarah.j@restrohub.com',
    newName: 'Ananya Patel',
    newEmail: 'ananya.p@restrohub.com'
  },
  {
    oldEmail: 'david.w@restrohub.com',
    newName: 'Vikram Singh',
    newEmail: 'vikram.s@restrohub.com'
  }
];

const updateStaffNames = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    
    for (const update of UPDATES) {
      const staff = await Staff.findOne({ email: update.oldEmail });
      if (staff) {
        staff.name = update.newName;
        staff.email = update.newEmail;
        await staff.save();
        console.log(`Updated ${update.oldEmail} to ${update.newName}`);
      }
    }

    console.log('Successfully updated staff names to Indian names!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateStaffNames();
