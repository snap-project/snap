/* jshint node:true */
var blueprint = require('../../util/blueprint');
var uuid = require('node-uuid');

var User = blueprint.create(
  'User',
  {
    title: 'User',
    description: 'A SNAP! user',
    type: 'object',
    properties: {

      uid: {
        description: 'The UUID (RFC4122) associated with this user.',
        type: 'string',
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      },

      pseudonym: {
        description: 'The user\'s pseudonym.',
        type: 'string'
      }

    },
    required: ['uid']
  },
  {
    initialize: function() {
      if(!this.has('uid')) {
        this.set('uid', uuid.v4());
      }
    }
  }
);

module.exports = User;
