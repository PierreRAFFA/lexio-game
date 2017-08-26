'use strict';
const get = require('lodash/get');
const reduce = require('lodash/reduce');

module.exports = () => {
  return function isAdmin(req, res, next) {
    console.log('middleware:isAdmin');

    let isAdmin = false;

    const roles = get(req, 'user.roles');
    if(roles) {
      isAdmin = reduce(roles, (result, role) => result || role.name === 'admin', false);
    }

    if (isAdmin) {
      console.log('isAdmin ? true');
      next();
    } else {
      res.status(401).send('Authorization required');
    }
  };
};