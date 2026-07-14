import mongoose from 'mongoose';
import Business from '../models/Business';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const cleanupCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found.');
      process.exit(1);
    }

    // Set exactly the standard top-level categories
    business.staffCategories = ['Chef', 'Waiter', 'Manager', 'Bartender', 'Cleaner'];
    await business.save();

    console.log('Successfully cleaned up staffCategories to:', business.staffCategories);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanupCategories();
