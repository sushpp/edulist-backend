// controllers/enquiryController.js
const Enquiry = require('../models/Enquiry');
const Institute = require('../models/Institute');

exports.create = async (req, res) => {
  try {
    const { institute, name, email, phone, message } = req.body;
    const inst = await Institute.findById(institute);
    if (!inst || !inst.isVerified) return res.status(400).json({ success: false, message: 'Institute not found or not approved' });

    const enquiry = await Enquiry.create({ user: req.user._id, institute, name, email, phone, message });
    res.status(201).json({ success: true, enquiry });
  } catch (err) {
    console.error('enquiry.create error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getInstituteEnquiries = async (req, res) => {
  try {
    const inst = await Institute.findOne({ user: req.user._id });
    if (!inst) return res.status(404).json({ success: false, message: 'Institute not found' });

    const enquiries = await Enquiry.find({ institute: inst._id }).populate('user', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (err) {
    console.error('enquiry.getInstituteEnquiries error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ user: req.user._id }).populate('institute', 'name category').sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (err) {
    console.error('enquiry.getUserEnquiries error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, enquiry });
  } catch (err) {
    console.error('enquiry.updateStatus error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.respond = async (req, res) => {
  try {
    const { response } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { response, status: 'contacted' }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, enquiry });
  } catch (err) {
    console.error('enquiry.respond error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
