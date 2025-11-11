const mongoose = require('mongoose');
const Institute = require('./models/Institute');
require('dotenv').config();

const cleanupRatings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edulist');
    console.log('Connected to MongoDB');

    // Find institutes with object ratings
    const institutes = await Institute.find({
      $or: [
        { rating: { $type: 'object' } },
        { reviewCount: { $type: 'object' } }
      ]
    });

    console.log(`Found ${institutes.length} institutes with object ratings`);

    for (const institute of institutes) {
      let updateNeeded = false;
      const updateData = {};

      // Fix rating if it's an object
      if (institute.rating && typeof institute.rating === 'object') {
        updateData.rating = institute.rating.average || 0;
        updateNeeded = true;
        console.log(`Fixing rating for ${institute.name}: ${institute.rating} -> ${updateData.rating}`);
      }

      // Fix reviewCount if it's an object
      if (institute.reviewCount && typeof institute.reviewCount === 'object') {
        updateData.reviewCount = institute.reviewCount.count || 0;
        updateNeeded = true;
        console.log(`Fixing reviewCount for ${institute.name}: ${institute.reviewCount} -> ${updateData.reviewCount}`);
      }

      if (updateNeeded) {
        await Institute.findByIdAndUpdate(institute._id, updateData);
        console.log(`✅ Updated ${institute.name}`);
      }
    }

    console.log('🎉 Rating cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

cleanupRatings();