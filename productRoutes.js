const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getData);
router.post('/add', productController.addProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/operation', productController.stockOperation);

module.exports = router;