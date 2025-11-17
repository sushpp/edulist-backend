const Enquiry = require('../models/Enquiry');
const Institute = require('../models/Institute');

// Create Enquiry
const createEnquiry = async (req, res) => {
  try {
    const { instituteId, message } = req.body;

    // Check if institute exists
    const institute = await Institute.findById(instituteId);
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    // Create new enquiry
    const newEnquiry = new Enquiry({
      userId: req.user.id,
      instituteId,
      message,
    });

    const enquiry = await newEnquiry.save();
    await enquiry.populate('userId', 'name email phone');
    await enquiry.populate('instituteId', 'name');

    res.json(enquiry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Enquiries for Institute
const getEnquiries = async (req, res) => {
  try {
    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    const enquiries = await Enquiry.find({ instituteId: institute._id })
      .populate('userId', 'name email phone')
      .sort({ date: -1 });

    res.json(enquiries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Enquiry Status
const updateEnquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['responded', 'closed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    let enquiry = await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({ msg: 'Enquiry not found' });
    }

    // Check if enquiry belongs to this institute
    if (enquiry.instituteId.toString() !== institute._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'name email phone').populate('instituteId', 'name');

    res.json(enquiry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
};