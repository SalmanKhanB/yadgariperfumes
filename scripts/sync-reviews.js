require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('../src/server/db/models/Product').default;
  const Review = require('../src/server/db/models/Review').default;
  
  const products = await Product.find({});
  for (let p of products) {
    const res = await Review.aggregate([
      { $match: { productId: p._id, status: 'approved' } },
      { $group: { _id: '$productId', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    if (res.length > 0) {
      p.averageRating = Number(res[0].averageRating.toFixed(1));
      p.reviewCount = res[0].count;
    } else {
      p.averageRating = 0;
      p.reviewCount = 0;
    }
    await p.save();
  }
  console.log('synced');
  process.exit(0);
});
