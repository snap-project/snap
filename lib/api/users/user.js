/* jshint node:true */
var Schematics = require('schematics');
var uuid = require('node-uuid');

var User = Schematics.create(
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

      nickname: {
        description: 'The user\'s nickname.',
        type: 'string'
      },

      isTemporary: {
        description: 'Is user temporary ?',
        type: 'boolean'
      }

    },
    required: ['uid']
  },
  {
    initialize: function() {
      if(!this.has('uid')) {
        this.set('uid', uuid.v4());
      }
      if(!this.has('nickname')) {
        this.set('nickname', 'Anon'+(Date.now() >> 2));
      }
    }
  }
);

module.exports = User;
