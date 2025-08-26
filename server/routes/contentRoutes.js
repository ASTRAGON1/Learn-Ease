const express = require('express');
const contentModel = require('../models/Content'); // Import the model
const path = require('path');
const router = express.Router();



router.get('/getContent', async (req, res) => {
  try {
    const contents = await contentModel.find({});
    res.json(contents);
  } catch (err) {
    console.log(err);
    process.exit(1)
  }
});

module.exports = router;
