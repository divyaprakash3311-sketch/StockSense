const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, productController.getAllProducts);
router.post('/', verifyToken, productController.createProduct);

module.exports = router;