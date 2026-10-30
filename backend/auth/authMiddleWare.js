// Authorization middleware. It is used to check if API calls have a valid authorization token.
// This is to protect API endpoints against unauthorized calls.

// Import Node.js module for verifying JWTs (JSON Web Tokens)
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    // Read the header of API calls called "Authorization", then split the token from that header
    const token = req.header('Authorization') &&
                  req.header('Authorization').split(' ')[1];

    // If there is no "Authorization" header, or no token in that header, authorization is denied
    if (!token) {
        return res.status(401).json({
            message: 'No token, authorization denied'
        });
    }
    // If there is an Authorization header and the token is valid, verify and decode it
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store the decoded user information in the request
        req.user = decoded;

        // Allow the API call to proceed
        next();
    } catch (err) {
        // If the token is not valid, the API call will not proceed
        return res.status(401).json({
            message: 'Token is not valid'
        });
    }
}


// Check whether the logged-in user has the required role
function requireRole(role) {

    return function (req, res, next) {

        if (req.user && req.user.role === role) {
            next();

        } else {
            res.status(403).json({
                message: 'Forbidden'
            });
        }
    };
}


// Export both middleware functions so they can be used in other files
module.exports = {
    requireAuth,
    requireRole
};