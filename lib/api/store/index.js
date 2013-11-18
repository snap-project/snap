var pouchDB = require('express-pouchdb');

module.exports = function(snap) {

  var expressApp = snap.server.expressApp;
  
  expressApp.use('/store', pouchDB);

};