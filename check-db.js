const mongoose = require('mongoose');

console.log('🔍 Checking Database State...');

mongoose.connect('mongodb://127.0.0.1:27017/edulist')
  .then(async () => {
    try {
      const User = mongoose.model('User');
      const Institute = mongoose.model('Institute');
      
      console.log('\n📊 DATABASE STATUS:');
      console.log('==================');
      
      // Count documents
      const userCount = await User.countDocuments();
      const instituteCount = await Institute.countDocuments();
      const pendingInstitutes = await Institute.countDocuments({ adminApproved: false });
      const approvedInstitutes = await Institute.countDocuments({ adminApproved: true });
      
      console.log(`👥 Users: ${userCount}`);
      console.log(`🏫 Total Institutes: ${instituteCount}`);
      console.log(`⏳ Pending Approval: ${pendingInstitutes}`);
      console.log(`✅ Approved: ${approvedInstitutes}`);
      
      // Show all institutes with their approval status
      console.log('\n🏫 ALL INSTITUTES:');
      console.log('================');
      const institutes = await Institute.find({});
      institutes.forEach(inst => {
        console.log(`- ${inst.name} | Approved: ${inst.adminApproved} | Category: ${inst.category}`);
      });
      
      // Show pending institutes in detail
      console.log('\n⏳ PENDING INSTITUTES (Should appear in admin panel):');
      console.log('=================================================');
      const pending = await Institute.find({ adminApproved: false });
      if (pending.length === 0) {
        console.log('❌ No pending institutes found!');
        console.log('💡 You need to register institutes first');
      } else {
        pending.forEach(inst => {
          console.log(`- ${inst.name} | ${inst.contactEmail} | ${inst.category}`);
        });
      }
      
      mongoose.connection.close();
      
    } catch (error) {
      console.error('Error:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err);
  });