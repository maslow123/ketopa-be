const { Router } = require('express');
const controllers = require('../controllers/products');
const router = Router();
const slug = '/product';
router.get(`${slug}/list`, controllers.getAllProduct);
router.get(`${slug}/detail/:id`, controllers.getDetailProduct);
router.post(`${slug}/create`, controllers.createProduct);
router.put(`${slug}/:id`, controllers.updateProduct);
router.delete(`${slug}/:id`, controllers.deleteProduct);

module.exports = router;