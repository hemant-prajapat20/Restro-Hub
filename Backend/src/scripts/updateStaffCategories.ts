import mongoose from 'mongoose';
import Business from '../models/Business';
import Staff from '../models/Staff';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const updateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dineandusk');
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found.');
      process.exit(1);
    }

    // Get all distinct roles from the Staff collection to ensure we capture everything
    const existingRoles = await Staff.distinct('role', { businessId: business._id });
    console.log('Roles currently assigned to staff:', existingRoles);

    // Combine with some standard categories
    const standardCategories = ['Chef', 'Waiter', 'Manager', 'Bartender', 'Cleaner'];

    // Merge, deduplicate
    const allCategories = Array.from(new Set([...standardCategories, ...existingRoles]));

    business.staffCategories = allCategories;
    await business.save();

    console.log('Successfully updated business staffCategories to:', business.staffCategories);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateCategories();
