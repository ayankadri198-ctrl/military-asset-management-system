const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, personnelController.getPersonnel);
router.get('/:id', authenticate, personnelController.getPersonnelById);
router.post('/', authenticate, authorize('Admin', 'Manager'), personnelController.createPersonnel);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), personnelController.updatePersonnel);
router.delete('/:id', authenticate, authorize('Admin'), personnelController.deletePersonnel);

module.exports = router;
