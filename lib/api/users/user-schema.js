// User JSON Schema - see http://json-schema.org/documentation.html
module.exports = {

  title: 'User Schema',

  type: 'object',

  properties: {

    id: {
      description: 'User Id',
      type: 'string'
    },

    username: {
      description: 'User\'s name',
      type: 'string'
    },

    authData: {
      description: 'User\'s authentication data',
      type: 'object'
    }

  },

  additionalProperties: false,

  required: ['id', 'username']

};
