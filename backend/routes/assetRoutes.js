const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, assetController.getAssets);
router.get('/:id', authenticate, assetController.getAssetById);
router.post('/', authenticate, authorize('Admin', 'Manager'), assetController.createAsset);
router.put('/:id', authenticate, authorize('Admin', 'Manager'), assetController.updateAsset);
router.delete('/:id', authenticate, authorize('Admin'), assetController.deleteAsset);

module.exports = router;
