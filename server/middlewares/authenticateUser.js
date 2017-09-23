'use strict';
const jwt = require('jsonwebtoken');
const get = require('lodash/get');
const reduce = require('lodash/reduce');
const assign = require('lodash/assign');

/**
 * Populates the request by setting the user.
 * This user can be retrieved from the next middlewares or the remote methods
 *
 * @returns {authenticateUser}
 */
module.exports = () => {
  return function authenticateUser(req, res, next) {
    console.log('middleware:authenticateUser');

    //get user information from JWT
    let token = getJWTToken(req);
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          res.status(500).send(err);
        } else {
          //assign the user
          req.user = user;

          next();
        }
      });
    }else{
      next();
    }
  };
};

function getJWTToken(req) {
  let token = req.headers.Authorization || req.headers.authorization;
  if (token) {
    const split = token.split(' ');

    if (split.length === 2) {
      token = split[1];
    }
  }

  return token;
}
