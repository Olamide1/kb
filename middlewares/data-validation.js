const path = require('path')
const _FILENAME = path.basename(__filename)

const Joi = require('joi')

const emailServiceBodySchema = Joi.object({
    subject: Joi.string()
        .min(2)
        .max(200)
        .rule({ message: 'No way your name is that long.' })
        .required(),
    body: Joi.string().required(),
    email: Joi.string().email().rule({ message: 'Please give us a valid email.' }).required(),
})

module.exports.validateTaikaEmailServiceBody = (req, res, next) => {
    const _FUNCTIONNAME = 'validateTaikaEmailServiceBody'
    console.log('hitting', _FILENAME, _FUNCTIONNAME)

    const { error, value } = emailServiceBodySchema.validate(req.body)
    if (error) {
        res.status(400).json({
            message:
                error.details?.[0]?.message ??
                'There is an issue with the data you provided',
            status: false,
            error,
        })
    } else {
        next()
    }
}
