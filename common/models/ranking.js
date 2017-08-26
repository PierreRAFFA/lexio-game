'use strict';

const take = require('lodash/take');
const assign = require('lodash/assign');

const RANKING_NUM_ITEMS = 100;

module.exports = function(Ranking) {

  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */

  // Ranking.disableRemoteMethodByName('create');
  Ranking.disableRemoteMethodByName('findById');
  Ranking.disableRemoteMethodByName('find');
  Ranking.disableRemoteMethodByName('upsert');
  Ranking.disableRemoteMethodByName('updateAll');
  Ranking.disableRemoteMethodByName('exists');
  Ranking.disableRemoteMethodByName('findOne');
  Ranking.disableRemoteMethodByName('deleteById');
  Ranking.disableRemoteMethodByName('count');
  Ranking.disableRemoteMethodByName('replaceOrCreate');
  Ranking.disableRemoteMethodByName('createChangeStream');
  Ranking.disableRemoteMethodByName('replaceById');
  Ranking.disableRemoteMethodByName('upsertWithWhere');
  Ranking.disableRemoteMethodByName('prototype.patchAttributes');


  //////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////// REMOTE METHODS
  /**
   * Returns the 15 latest games played
   * Calls the AuthService to get the user information (send accessToken and not JWT)
   */
  Ranking.remoteMethod('current', {
    http: {
      path: '/current',
      verb: 'get'
    },
    accepts: [
      {"arg": "options", "type": "object", "http": "optionsFromRequest"}
    ],
    returns: { arg:'ranking', type: Ranking, root: true }
  });

  Ranking.current = function (options) {
    return Ranking.findOne({order: 'endDate'}).then(ranking => {
      if (ranking) {
        let json = JSON.parse(JSON.stringify(ranking));
        json = assign({}, json, {
          ranking: take(json.ranking, RANKING_NUM_ITEMS)
        });
        return json;
      }else{
        return [];
      }
    });
  }
};
