const { Router } = require('express');
const controllers = require('../controllers/users');
const router = Router();
const slug = '/user';

router.get(`${slug}/list`, controllers.getAllUser);
router.post(`${slug}/login`, controllers.loginUser);
router.post(`${slug}/create`, controllers.createUser);
router.put(`${slug}/:id`, controllers.updateUser);
router.delete(`${slug}/:id`, controllers.deleteUser);


module.exports = router;