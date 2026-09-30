const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, equipmentController.getEquipment);
router.get('/:id', authenticate, equipmentController.getEquipmentById);
router.post('/', authenticate, authorize('Admin', 'Manager'), equipmentController.createEquipment);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), equipmentController.updateEquipment);
router.delete('/:id', authenticate, authorize('Admin'), equipmentController.deleteEquipment);

module.exports = router;
