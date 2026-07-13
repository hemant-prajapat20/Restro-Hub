import mongoose from 'mongoose';
import Business from '../models/Business';
import CafeItem from '../models/CafeItem';
import LiquorItem from '../models/LiquorItem';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const CAFE_ITEMS = [
  {
    name: 'Ethiopian Yirgacheffe Pour Over',
    category: 'Specialty Beans',
    originOrType: 'Yirgacheffe, Ethiopia (Light Roast)',
    price: 1500,
    stockCount: 20,
    roastOrBakeTime: 'Roast Date: Last Week',
    scoreOrAward: 'SCA Score: 92.0',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=400&fit=crop'
  },
  {
    name: 'Classic French Butter Croissant',
    category: 'Artisan Patisserie',
    originOrType: 'Authentic French Recipe',
    price: 250,
    stockCount: 30,
    roastOrBakeTime: 'Fresh Baked: 6:00 AM',
    scoreOrAward: 'Best Bakery Award',
    image: 'https://images.unsplash.com/photo-1549903072-7e6e0d65666f?w=400&h=400&fit=crop'
  },
  {
    name: 'Nitro Vanilla Sweet Cream',
    category: 'Cold Brew',
    originOrType: '24-Hour Steeped Cold Brew',
    price: 550,
    stockCount: 40,
    roastOrBakeTime: 'Brewing Temp: 4.0 °C',
    scoreOrAward: 'Summer Favorite',
    image: 'https://images.unsplash.com/photo-1461023058943-0708ce161109?w=400&h=400&fit=crop'
  },
  {
    name: 'Caramel Macchiato Reserve',
    category: 'Signature Beverage',
    originOrType: 'Espresso with Steamed Milk',
    price: 400,
    stockCount: 50,
    roastOrBakeTime: 'Extraction Time: 28s',
    scoreOrAward: 'Customer Choice',
    image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=400&fit=crop'
  },
  {
    name: 'Colombian Supremo Dark Roast',
    category: 'Specialty Beans',
    originOrType: 'Antioquia, Colombia (Dark)',
    price: 1200,
    stockCount: 25,
    roastOrBakeTime: 'Roast Date: Yesterday',
    scoreOrAward: 'SCA Score: 88.5',
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=400&h=400&fit=crop'
  },
  {
    name: 'Pistachio Eclair',
    category: 'Artisan Patisserie',
    originOrType: 'Choux Pastry',
    price: 320,
    stockCount: 15,
    roastOrBakeTime: 'Fresh Baked: 7:00 AM',
    scoreOrAward: 'Chef Special',
    image: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=400&fit=crop'
  },
  {
    name: 'Mint Mocha Iced Frappe',
    category: 'Signature Beverage',
    originOrType: 'Blended Iced Coffee',
    price: 450,
    stockCount: 60,
    roastOrBakeTime: 'Blended: On Demand',
    scoreOrAward: 'Refreshing Pick',
    image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop'
  },
  {
    name: 'Matcha Green Tea Latte',
    category: 'Signature Beverage',
    originOrType: 'Premium Japanese Matcha',
    price: 480,
    stockCount: 35,
    roastOrBakeTime: 'Whisked: On Demand',
    scoreOrAward: 'Healthy Choice',
    image: 'https://images.unsplash.com/photo-1536514072410-5019a3c69182?w=400&h=400&fit=crop'
  }
];

const LIQUOR_ITEMS = [
  {
    name: 'Macallan 18 Year Old',
    vintage: '18 Years Old',
    category: 'Single Malt',
    alcoholContent: '43%',
    pricePerGlass: 3500,
    stockBottles: 8,
    capacityMl: 750,
    stockMl: 6000,
    variants: [{ sizeMl: 30, price: 1800 }, { sizeMl: 60, price: 3500 }],
    origin: 'Speyside, Scotland',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop'
  },
  {
    name: 'Château Margaux 2015',
    vintage: '2015',
    category: 'Vintage Wine',
    alcoholContent: '13.5%',
    pricePerGlass: 4500,
    stockBottles: 4,
    capacityMl: 750,
    stockMl: 3000,
    variants: [{ sizeMl: 150, price: 4500 }, { sizeMl: 750, price: 21000 }],
    origin: 'Bordeaux, France',
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400&h=400&fit=crop'
  },
  {
    name: 'Hennessy X.O',
    vintage: 'Extra Old',
    category: 'Cognac',
    alcoholContent: '40%',
    pricePerGlass: 2800,
    stockBottles: 12,
    capacityMl: 700,
    stockMl: 8400,
    variants: [{ sizeMl: 30, price: 1500 }, { sizeMl: 60, price: 2800 }],
    origin: 'Cognac, France',
    image: 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?w=400&h=400&fit=crop'
  },
  {
    name: 'Smoked Old Fashioned',
    vintage: 'Classic',
    category: 'Craft Cocktail',
    alcoholContent: '22%',
    pricePerGlass: 900,
    stockBottles: 100, // conceptual
    capacityMl: 200,
    stockMl: 20000,
    variants: [{ sizeMl: 200, price: 900 }],
    origin: 'House Mix',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop'
  },
  {
    name: 'Glenfiddich 21 Year Old',
    vintage: '21 Years Old',
    category: 'Single Malt',
    alcoholContent: '40%',
    pricePerGlass: 4200,
    stockBottles: 5,
    capacityMl: 750,
    stockMl: 3750,
    variants: [{ sizeMl: 30, price: 2200 }, { sizeMl: 60, price: 4200 }],
    origin: 'Speyside, Scotland',
    image: 'https://images.unsplash.com/photo-1615456223253-8b7c7b802e3b?w=400&h=400&fit=crop'
  },
  {
    name: 'Dom Pérignon Vintage 2012',
    vintage: '2012',
    category: 'Vintage Wine',
    alcoholContent: '12.5%',
    pricePerGlass: 5000,
    stockBottles: 6,
    capacityMl: 750,
    stockMl: 4500,
    variants: [{ sizeMl: 150, price: 5000 }, { sizeMl: 750, price: 24000 }],
    origin: 'Champagne, France',
    image: 'https://images.unsplash.com/photo-1590494493393-274646700c25?w=400&h=400&fit=crop'
  },
  {
    name: 'Rémy Martin Louis XIII',
    vintage: 'Ultra Premium',
    category: 'Cognac',
    alcoholContent: '40%',
    pricePerGlass: 15000,
    stockBottles: 2,
    capacityMl: 700,
    stockMl: 1400,
    variants: [{ sizeMl: 30, price: 8000 }, { sizeMl: 60, price: 15000 }],
    origin: 'Cognac, France',
    image: 'https://images.unsplash.com/photo-1579782520379-3c734dafa6a1?w=400&h=400&fit=crop'
  },
  {
    name: 'Spicy Margarita',
    vintage: 'Signature',
    category: 'Craft Cocktail',
    alcoholContent: '18%',
    pricePerGlass: 850,
    stockBottles: 100,
    capacityMl: 250,
    stockMl: 25000,
    variants: [{ sizeMl: 250, price: 850 }],
    origin: 'House Mix',
    image: 'https://images.unsplash.com/photo-1587223075055-82e9a937ddff?w=400&h=400&fit=crop'
  }
];

const seedAdditionalItems = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/restrohub');
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found. Run the main seeder first.');
      process.exit(1);
    }
    
    console.log('Seeding Cafe Items...');
    for (const item of CAFE_ITEMS) {
      await CafeItem.create({ ...item, businessId: business._id });
    }

    console.log('Seeding Liquor Items...');
    for (const item of LIQUOR_ITEMS) {
      await LiquorItem.create({ ...item, businessId: business._id });
    }

    console.log('Successfully seeded additional Cafe and Liquor items!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdditionalItems();
