const Review = require('../models/Review');
const Institute = require('../models/Institute');

// Update institute rating when a review is created/updated
exports.updateInstituteRating = async (instituteId) => {
  try {
    const reviews = await Review.find({ institute: instituteId, isApproved: true });
    const totalReviews = reviews.length;
    
    if (totalReviews > 0) {
      const avgRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
      
      await Institute.findByIdAndUpdate(instituteId, {
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews: totalReviews
      });
    } else {
      await Institute.findByIdAndUpdate(instituteId, {
        avgRating: 0,
        totalReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating institute rating:', error);
  }
};