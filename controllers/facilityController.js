const Facility = require('../models/Facility');
const Institute = require('../models/Institute');

// Create Facility
const createFacility = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    // Create new facility
    const newFacility = new Facility({
      name,
      description,
      instituteId: institute._id,
    });

    const facility = await newFacility.save();

    // Add facility to institute
    await Institute.findByIdAndUpdate(
      institute._id,
      { $push: { facilities: facility._id } }
    );

    res.json(facility);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get All Facilities for Institute
const getFacilities = async (req, res) => {
  try {
    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    const facilities = await Facility.find({ instituteId: institute._id });
    res.json(facilities);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update Facility
const updateFacility = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    // Build facility object
    const facilityFields = {};
    if (name) facilityFields.name = name;
    if (description) facilityFields.description = description;

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    let facility = await Facility.findById(id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found' });
    }

    // Check if facility belongs to this institute
    if (facility.instituteId.toString() !== institute._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    facility = await Facility.findByIdAndUpdate(
      id,
      { $set: facilityFields },
      { new: true }
    );

    res.json(facility);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete Facility
const deleteFacility = async (req, res) => {
  try {
    const { id } = req.params;

    // Get institute for this user
    const institute = await Institute.findOne({ userId: req.user.id });
    if (!institute) {
      return res.status(404).json({ msg: 'Institute not found' });
    }

    let facility = await Facility.findById(id);

    if (!facility) {
      return res.status(404).json({ msg: 'Facility not found' });
    }

    // Check if facility belongs to this institute
    if (facility.instituteId.toString() !== institute._id.toString()) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Facility.findByIdAndDelete(id);

    // Remove facility from institute
    await Institute.findByIdAndUpdate(
      institute._id,
      { $pull: { facilities: id } }
    );

    res.json({ msg: 'Facility removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createFacility,
  getFacilities,
  updateFacility,
  deleteFacility,
};