'use strict';
module.exports = () => {
  return function isAuthenticated(req, res, next) {
    console.log('middleware:isAuthenticated');
    console.log(req.user);
    if (req.user) {
      console.log('isAuthenticated ? true');
      next();
    } else {
      res.status(401).send('Authorization required');
    }
  };
};
