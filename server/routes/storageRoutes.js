const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/storageController');

router.get('/', auth(['teacher']), ctrl.getContent);
router.post('/', auth(['teacher']), ctrl.createContent);

module.exports = router;