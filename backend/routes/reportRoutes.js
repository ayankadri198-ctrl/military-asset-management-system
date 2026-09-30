const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

router.get('/summary', authenticate, reportController.getSummaryReport);
router.get('/export', authenticate, reportController.exportData);

module.exports = router;
