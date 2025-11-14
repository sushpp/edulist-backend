// controllers/enquiryController.js
const Enquiry = require('../models/Enquiry');
const Institute = require('../models/Institute');

exports.create = async (req, res) => {
  try {
    const { institute: instituteId, name, email, phone, message, course, preferredTiming, notes } = req.body;
    if (!instituteId || !name || !message) return res.status(400).json({ success: false, message: 'institute, name and message are required' });

    const inst = await Institute.findById(instituteId);
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    const enquiry = await Enquiry.create({
      name, email, phone, message, institute: instituteId, course: course || null, preferredTiming, notes
    });

    res.status(201).json({ success: true, enquiry });
  } catch (err) {
    console.error('enquiry.create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getInstituteEnquiries = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    const enquiries = await Enquiry.find({ institute: inst._id }).sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (err) {
    console.error('enquiry.getInstituteEnquiries error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ email: req.user.email }).populate('institute', 'name').sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (err) {
    console.error('enquiry.getUserEnquiries error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in-progress', 'completed'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    const updated = await Enquiry.findByIdAndUpdate(req.params.id, { followUpStatus: status }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found' });

    res.json({ success: true, enquiry: updated });
  } catch (err) {
    console.error('enquiry.updateStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.respond = async (req, res) => {
  try {
    const { response } = req.body;
    const updated = await Enquiry.findByIdAndUpdate(req.params.id, { response, followUpStatus: 'in-progress' }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, enquiry: updated });
  } catch (err) {
    console.error('enquiry.respond error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
