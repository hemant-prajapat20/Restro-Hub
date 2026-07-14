const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://RestroHub:restro12345@ac-jgcl1jz-shard-00-00.zjrojih.mongodb.net:27017,ac-jgcl1jz-shard-00-01.zjrojih.mongodb.net:27017,ac-jgcl1jz-shard-00-02.zjrojih.mongodb.net:27017/?ssl=true&replicaSet=atlas-13fvga-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const menuItemSchema = new mongoose.Schema({}, { strict: false });
    const MenuItem = mongoose.model('MenuItem', menuItemSchema, 'menuitems');

    // Update Pizzas
    await MenuItem.updateMany(
      { category: 'Pizza' },
      {
        $set: {
          variants: [
            { name: 'Regular', price: 0 },
            { name: 'Medium', price: 150 },
            { name: 'Large', price: 250 }
          ],
          addons: [
            { name: 'Extra Cheese', price: 50 },
            { name: 'Paneer', price: 60 },
            { name: 'Jalapenos', price: 30 }
          ]
        }
      }
    );
    console.log('Updated Pizzas');

    // Update Burgers
    await MenuItem.updateMany(
      { category: 'Burger' },
      {
        $set: {
          variants: [
            { name: 'Standard', price: 0 },
            { name: 'Double Patty', price: 120 }
          ],
          addons: [
            { name: 'Extra Cheese', price: 30 },
            { name: 'Fries on side', price: 80 }
          ]
        }
      }
    );
    console.log('Updated Burgers');

    // Update Coffee / Beverage
    await MenuItem.updateMany(
      { category: { $in: ['Beverage', 'Coffee', 'Cold Brew', 'Hot Coffee'] } },
      {
        $set: {
          variants: [
            { name: 'Small', price: 0 },
            { name: 'Large', price: 40 }
          ],
          addons: [
            { name: 'Extra Shot', price: 50 },
            { name: 'Hazelnut Syrup', price: 40 }
          ]
        }
      }
    );
    console.log('Updated Beverages');

    // If they have a Margherita Pizza exactly, let's make sure it updates
    await MenuItem.updateMany(
      { name: { $regex: /Pizza/i }, category: { $ne: 'Pizza' } },
      {
        $set: {
          variants: [
            { name: 'Regular', price: 0 },
            { name: 'Large', price: 250 }
          ],
          addons: [
            { name: 'Extra Cheese', price: 50 },
            { name: 'Paneer', price: 60 }
          ]
        }
      }
    );

    console.log('Menu items seeded with variants and addons successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
