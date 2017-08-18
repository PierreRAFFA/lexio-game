'use strict';
const jwt = require('jsonwebtoken');

module.exports = () => {
  return function isAuthenticated(req, res, next) {
    console.log('isAuthenticated ?');
    let token = getJWTToken(req);
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        console.log(err);
        console.log(decoded);
        if (err) {
          res.status(500).send(err);
        } else {
          console.log('isAuthenticated ? true');
          req.user = decoded;
          next();
        }
      });
    }else{
      res.status(401).send('Authorization required');
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
