const { Router } = require('express');
const controllers = require('../controllers/categories');
const router = Router();
const slug = '/category';
router.get(`${slug}/list`, controllers.getAllCategory);
router.get(`${slug}/detail/:id`, controllers.getDetailCategory);
router.post(`${slug}/create`, controllers.createCategory);
router.put(`${slug}/:id`, controllers.updateCategory);
router.delete(`${slug}/:id`, controllers.deleteCategory);

module.exports = router;