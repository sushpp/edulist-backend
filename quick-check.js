const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/edulist')
  .then(async () => {
    const User = mongoose.model('User');
    const Institute = mongoose.model('Institute');
    
    console.log('📊 CURRENT DATABASE:');
    console.log('Users:', await User.find({}, 'name email role'));
    console.log('Institutes:', await Institute.find({}, 'name adminApproved'));
    
    mongoose.connection.close();
  });