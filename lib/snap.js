var App = require('armature').App;
var util = require('util');

module.exports = Snap;

function Snap() {
  
  this.client = {};
  this.server = {};

  this._loadConfig();
  this._initLogger();

}

util.inherits(Snap, App);

var p = Snap.prototype;

p._initLogger = function() {
  
};

p._loadConfig = function() {
  
};

