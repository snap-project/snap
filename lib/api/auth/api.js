
module.exports = function AuthApiFactory(users) {

  var api = {};

  api.authenticate = function(credentials, cb) {
    return cb(null, users.create({'username': 'foo'}));
  };

  return api;

};
