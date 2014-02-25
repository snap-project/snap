// User JSON Schema - see http://json-schema.org/documentation.html
module.exports = {

  title: 'User Schema',

  type: 'object',

  properties: {

    id: {
      description: 'User Id',
      type: 'string'
    },

    nickname: {
      description: 'User\'s nickname',
      type: 'string'
    }

  },

  additionalProperties: false,

  required: ['id', 'nickname']

};