const nodemailer = require('nodemailer')

const path = require('path')
const _FILENAME = path.basename(__filename)

exports.sendTaikaEmail = async (req, res) => {
    const _FUNCTIONNAME = 'sendTaikaEmail'
    console.log('hitting', _FILENAME, _FUNCTIONNAME)

    const mailerOptions = {
        host: process.env.TAIKA_CHUKS_EMAIL_SMTP_SERVER,
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.TAIKA_CHUKS_EMAIL_ADDRESS,
            pass: process.env.TAIKA_CHUKS_EMAIL_PASSWORD,
        },
    }

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(mailerOptions)

    // send mail with defined transport object
    transporter.sendMail(
        {
            from: `"Taika by Placeholder" <${process.env.TAIKA_CHUKS_EMAIL_ADDRESS}>`, // sender address
            to: `${req.body.email}, ${process.env.OLA_GMAIL_ADDRESS}`, // list of receivers
            subject: req.body.subject, // Subject line
            text: req.body.body, // plain text body
            html: '<b>' + req.body.body + '</b>', // html body
        },
        (error, info) => {
            if (error) {
                console.error(error) // show a 'email doesn't exist notification'
                res.status(400).send({ success: false })
            } else {
                if (Array.isArray(info.rejected) && info.rejected.length > 0) {
                    /**
                     * means one of the emails did not send.
                     *
                     * Not sure if the rejected array would be filled immediately ...
                     */
                    // res.status(200).send({ success: false, message: "We couldn't send a message to " . info.rejected.toString() })
                }

                console.log('Sent email: %s', info.messageId)
                // Sent email: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                res.status(200).send({ success: true })
            }
        }
    )
}
