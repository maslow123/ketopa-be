const { Router } = require('express');
const controllers = require('../controllers/transactions');
const router = Router();
const slug = '/transaction';
router.get(`${slug}/list`, controllers.getAllTransaction);
router.get(`${slug}/detail/:id`, controllers.getDetailTransaction);
router.post(`${slug}/create`, controllers.createTransaction);
router.put(`${slug}/:transactionCode`, controllers.updateTransaction);

module.exports = router;