const express = require("express")
const router = express.Router()
const shortyController = require("../controllers/shorty.controller")

router.get('/', shortyController.getUrlList)
router.post('/addurl', shortyController.addURL)
router.post('/deleteurls', shortyController.deleteURL)
router.put('/edit/:Id', shortyController.editURL)
router.post('/url/:urlId', shortyController.getURLDetails)
router.get('/redirect/:shortyId', shortyController.redirectUrl)

module.exports = router