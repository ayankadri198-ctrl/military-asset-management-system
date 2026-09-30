const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, vehicleController.getVehicles);
router.get('/:id', authenticate, vehicleController.getVehicleById);
router.post('/', authenticate, authorize('Admin', 'Manager'), vehicleController.createVehicle);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), vehicleController.updateVehicle);
router.delete('/:id', authenticate, authorize('Admin'), vehicleController.deleteVehicle);

module.exports = router;
