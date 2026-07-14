import mongoose from 'mongoose';
import Business from '../models/Business';
import Staff from '../models/Staff';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const NEW_STAFF = [
  {
    name: 'Emma Roberts',
    role: 'Senior Waitress',
    contact: '9876543210',
    email: 'emma.r@restrohub.com',
    shift: 'Morning (8 AM - 4 PM)',
    salary: 25000,
    score: 4.8,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
  },
  {
    name: 'Michael Chen',
    role: 'Sous Chef',
    contact: '8765432109',
    email: 'michael.c@restrohub.com',
    shift: 'Evening (4 PM - 12 AM)',
    salary: 45000,
    score: 4.9,
    status: 'Clocked In',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Bartender',
    contact: '7654321098',
    email: 'sarah.j@restrohub.com',
    shift: 'Evening (4 PM - 12 AM)',
    salary: 30000,
    score: 4.7,
    status: 'Active',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
  },
  {
    name: 'David Wilson',
    role: 'Restaurant Manager',
    contact: '6543210987',
    email: 'david.w@restrohub.com',
    shift: 'Full Day (10 AM - 10 PM)',
    salary: 65000,
    score: 5.0,
    status: 'Clocked In',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
  }
];

const seedAdditionalStaff = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found. Run the main seeder first.');
      process.exit(1);
    }
    
    console.log('Seeding additional staff...');
    for (const staffData of NEW_STAFF) {
      const existing = await Staff.findOne({ businessId: business._id, contact: staffData.contact });
      if (!existing) {
        await Staff.create({ ...staffData, businessId: business._id });
        console.log(`Created staff member: ${staffData.name}`);
      } else {
        console.log(`Staff ${staffData.name} already exists, skipping.`);
      }
    }

    console.log('Successfully seeded additional staff!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdditionalStaff();
