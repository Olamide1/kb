const path = require('path');
const _FILENAME = path.basename(__filename);


module.exports.checkEmailServiceRequest = (req, res, next) => {
    const _FUNCTIONNAME = 'checkEmailServiceRequest'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    /**
     * TODO: check the x-forwarded header request,
     * or sth similar to make sure
     * the request is coming from where we're expecting it to come from.
     */
    next()

}