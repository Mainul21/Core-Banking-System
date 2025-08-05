const express = require('express');
const router = express.Router();
const pool = require('../db'); // PostgreSQL connection

// Route to get all branches
router.get('/', async (req, res) => {
  try {
    // Query the database to fetch all branches
    const result = await pool.query('SELECT * FROM branches');
    
    // Check if there are branches
    if (result.rows.length > 0) {
      return res.status(200).json(result.rows); // Send the list of branches
    } else {
      return res.status(404).json({ message: 'No branches found' }); // In case no branches exist
    }
  } catch (err) {
    console.error('Error in /api/branches:', err);
    return res.status(500).json({ message: 'Server error' }); // Handle any other errors
  }
});

module.exports = router;
