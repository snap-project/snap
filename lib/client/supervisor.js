var Dispatcher = require('./dispatcher');

// Supervisor constructor
function Supervisor() {
  this._dispatcher = new Dispatcher();
}

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;



