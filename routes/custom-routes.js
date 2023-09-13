const express = require('express')
let router = express.Router()

const emailService = require('../services/send-emails')
const authMiddleware = require('../middlewares/auth')
const dataValidation = require('../middlewares/data-validation')

const CUSTOM_ENDPOINT = '/custom'

router.post(
    `${CUSTOM_ENDPOINT}/taika/send-email`,
    authMiddleware.checkEmailServiceRequest,
    express.json(),
    dataValidation.validateTaikaEmailServiceBody,
    emailService.sendTaikaEmail
)

module.exports = router
