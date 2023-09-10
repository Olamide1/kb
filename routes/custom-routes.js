const express = require('express')
let router = express.Router()

const emailService = require('../services/send-emails')
const authMiddleware = require('../middlewares/auth')

const CUSTOM_ENDPOINT = '/custom'

router.post(
    `${CUSTOM_ENDPOINT}/taika/send-email`,
    authMiddleware.checkEmailServiceRequest,
    express.json(),
    emailService.sendTaikaEmail
)

module.exports = router
