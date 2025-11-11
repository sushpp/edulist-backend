<<<<<<< HEAD
=======
<<<<<<< HEAD
const Institute = require('../models/Institute');

// Add facility to institute
exports.addFacility = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { name, description } = req.body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Facility name is required' });
    }

    // Check if facility already exists
    const existingFacility = institute.facilities.find(
      facility => facility.name.toLowerCase() === name.toLowerCase().trim()
    );

    if (existingFacility) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }

    // Add new facility
    const newFacility = {
      name: name.trim(),
      description: description ? description.trim() : ''
    };

    institute.facilities.push(newFacility);
    await institute.save();

    res.status(201).json({
      message: 'Facility added successfully',
      facilities: institute.facilities
    });
  } catch (error) {
    console.error('Add facility error:', error);
    res.status(500).json({ message: 'Server error while adding facility', error: error.message });
  }
};

// Remove facility from institute
exports.removeFacility = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { facilityId } = req.params;
    
    if (!facilityId) {
      return res.status(400).json({ message: 'Facility ID is required' });
    }

    // Find facility index
    const facilityIndex = institute.facilities.findIndex(
      facility => facility._id.toString() === facilityId
    );

    if (facilityIndex === -1) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Remove facility
    institute.facilities.splice(facilityIndex, 1);
    await institute.save();

    res.json({
      message: 'Facility removed successfully',
      facilities: institute.facilities
    });
  } catch (error) {
    console.error('Remove facility error:', error);
    res.status(500).json({ message: 'Server error while removing facility', error: error.message });
  }
};

// Get all facilities for institute
exports.getFacilities = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    res.json({
      facilities: institute.facilities || []
    });
  } catch (error) {
    console.error('Get facilities error:', error);
    res.status(500).json({ message: 'Server error while fetching facilities', error: error.message });
  }
};

// Update facility
exports.updateFacility = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });
    
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { facilityId } = req.params;
    const { name, description } = req.body;
    
    if (!facilityId) {
      return res.status(400).json({ message: 'Facility ID is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Facility name is required' });
    }

    // Find facility
    const facility = institute.facilities.id(facilityId);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Check if name already exists (excluding current facility)
    const existingFacility = institute.facilities.find(
      f => f._id.toString() !== facilityId && f.name.toLowerCase() === name.toLowerCase().trim()
    );

    if (existingFacility) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }

    // Update facility
    facility.name = name.trim();
    facility.description = description ? description.trim() : '';
    
    await institute.save();

    res.json({
      message: 'Facility updated successfully',
      facilities: institute.facilities
    });
  } catch (error) {
    console.error('Update facility error:', error);
    res.status(500).json({ message: 'Server error while updating facility', error: error.message });
=======
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
const Facility = require('../models/Facility');

exports.getInstituteFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ institute: req.params.instituteId });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createFacility = async (req, res) => {
  try {
    const facility = new Facility({
      ...req.body,
      institute: req.params.instituteId
    });
    await facility.save();
    res.status(201).json({ message: 'Facility created successfully', facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json({ message: 'Facility updated successfully', facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteFacility = async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.toggleFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    facility.isAvailable = !facility.isAvailable;
    await facility.save();
    res.json({ message: 'Facility status updated', facility });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
<<<<<<< HEAD
=======
>>>>>>> c15d45fca (Initial commit)
>>>>>>> c12b9554ad867aeeab065de4f2c4fbf7a05570bc
  }
};