const Institute = require('../models/Institute');

// ✅ Add a new facility to the logged-in institute
exports.addFacility = async (req, res) => {
  try {
    const institute = await Institute.findOne({ user: req.user.id });

    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }

    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Facility name is required' });
    }

    // Prevent duplicate facility names
    const existingFacility = institute.facilities.find(
      facility => facility.name.toLowerCase() === name.toLowerCase().trim()
    );

    if (existingFacility) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }

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

// ✅ Remove a facility from an institute
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

    const facilityIndex = institute.facilities.findIndex(
      facility => facility._id.toString() === facilityId
    );

    if (facilityIndex === -1) {
      return res.status(404).json({ message: 'Facility not found' });
    }

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

// ✅ Get all facilities for the logged-in institute
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

// ✅ Update a specific facility
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

    const facility = institute.facilities.id(facilityId);
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    // Prevent duplicate name (excluding current)
    const duplicate = institute.facilities.find(
      f => f._id.toString() !== facilityId && f.name.toLowerCase() === name.toLowerCase().trim()
    );

    if (duplicate) {
      return res.status(400).json({ message: 'Facility with this name already exists' });
    }

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
  }
};
