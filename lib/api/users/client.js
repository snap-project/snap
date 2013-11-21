// Client Side
module.exports = function() {

  function usersServiceFactory(appName, config) {

    var users = {};



    return users;

  }

  this.registerService('users', usersServiceFactory);

};