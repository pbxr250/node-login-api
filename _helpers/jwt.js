const expressJwt = require('express-jwt');
const config = require('config.json');
const userService = require('../users/user.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/',
            '/login',
            '/register',
            '/index.html',
            '/main.js',
            '/users/authenticate',
            '/users/register'
        ]
    });
}

async function isRevoked(req, payload, done) {
    const user = await userService.getById(payload.id)
    .then(user => user ? done() : done(null, true))
    .catch(err => done(err, true));

    // // revoke token if user no longer exists
    // if (!user) {
    //     return done(null, true);
    // }

    // done();
};