const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, maintenanceController.getMaintenance);
router.get('/:id', authenticate, maintenanceController.getMaintenanceById);
router.post('/', authenticate, authorize('Admin', 'Manager', 'Staff'), maintenanceController.createMaintenance);
router.put('/:id', authenticate, authorize('Admin', 'Manager', 'Staff'), maintenanceController.updateMaintenance);
router.delete('/:id', authenticate, authorize('Admin', 'Manager'), maintenanceController.deleteMaintenance);

module.exports = router;
