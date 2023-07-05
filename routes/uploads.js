const { Router } = require('express');
const controllers = require('../controllers/uploads');
const router = Router();
const slug = '/upload';
router.post(`${slug}/:category`, controllers.uploadEvidence);
router.get(`${slug}/image/:category/:filename`, controllers.getImage);

module.exports = router;