'use strict';
const request = require('request');

const map = require('lodash/map');
const uniq = require('lodash/uniq');
const assign = require('lodash/assign');
const filter = require('lodash/filter');
const head = require('lodash/head');
const get = require('lodash/get');

module.exports = function (Game) {

  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */

  // Game.disableRemoteMethodByName('create');
  // Game.disableRemoteMethodByName('findById');
  Game.disableRemoteMethodByName('find');
  Game.disableRemoteMethodByName('upsert');
  Game.disableRemoteMethodByName('updateAll');
  Game.disableRemoteMethodByName('exists');
  Game.disableRemoteMethodByName('findOne');
  Game.disableRemoteMethodByName('deleteById');
  Game.disableRemoteMethodByName('count');
  Game.disableRemoteMethodByName('replaceOrCreate');
  Game.disableRemoteMethodByName('createChangeStream');
  Game.disableRemoteMethodByName('replaceById');
  Game.disableRemoteMethodByName('upsertWithWhere');
  Game.disableRemoteMethodByName('prototype.patchAttributes');

  //////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////// OVERRIDE BUILT IN METHODS
  /**
   * Returns the 15 latest games played
   * Calls the AuthService to get the user informations (send accessToken and not JWT)
   */
  Game.remoteMethod('read', {
    http: {
      path: '/',
      verb: 'get'
    },
    accepts: [
      {"arg": "filters", "type": "object"},
      {"arg": "options", "type": "object", "http": "optionsFromRequest"}
    ],
    returns: { arg:'game', type: [Game], root: true }
  });

  Game.read = function (filters, options, cb) {

    const currentUser = options.currentUser;
    const accessToken = options.accessToken;

    filters = assign({}, filters, {
      order: 'creationDate DESC',
    });

    //force the limit to be 15
    // if (currentUser.roles.indexOf('admin') === -1) {
      filters = assign({}, filters, {
        limit: 15
      });
    // }

    Game.find(filters).then(games => {
      const userIds = uniq(map(games, game => {
        return game.userId;
      }));

      getUserInformations(userIds, accessToken)
        .then( users => {
          games = map(games, game => {
            //set the server date
            game.serverDate = new Date().toISOString();

            //set the game user

            game.__data.user = head(filter(users, user => user.id.toString() === game.userId));
            return game;
          });

          cb(null, games);
        })
        .catch(error => {
          cb(error);
        });
    });
  };

  //////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////// HOOKS
  Game.observe('before save', function (ctx, next) {
    const instance = ctx.instance || ctx.currentInstance;

    if(ctx.isNewInstance) {
      instance.creationDate = new Date();
      instance.userId = get(ctx, 'options.currentUser.id');
    }
    next();
  });

  /**
   * After save, update the user statistics
   */
  Game.observe('after save', function (ctx, next) {
    console.log('supports isNewInstance?', ctx.isNewInstance !== undefined);
    const game = ctx.instance;

    const accessToken = ctx.options.accessToken;

    let options = {
      url: `http://lexio-authentication:3010/api/users/me/consume-game?access_token=${accessToken}`,
      form: {game: JSON.stringify(game)},
    };
    request.post(options, (error, response, body) => {
      if (error) {
        res.status(response.status).send(error);
      } else {
        next();
      }
    });
  });
};

function getUserInformations(userIds, accessToken) {
  return new Promise((resolve, reject) => {
    const filters = { where: { id: { inq: userIds } } };

    const url = `http://lexio-authentication:3010/api/users?access_token=${accessToken}&filters=${JSON.stringify(filters)}`;

    request(url, (error, response, body) => {
      if (error) {
        reject({status: response.status, error: error})
      } else {
        resolve(JSON.parse(body));
      }
    });
  });
}