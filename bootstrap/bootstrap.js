/* jshint node: true */
var window = global.window;
var gui = window.nwDispatcher.requireNwGui();
var Snap = require('snap-lib').Snap;

var app = new Snap();

app.startWebServer(function(err) {

  if(err) {
    app.logger.error(err.stack ? err.stack : err);
    process.exit(1);
  }

  gui.Window.get().close();
  var port = app.config.get('server:port');
  var windowConfig = app.config.get('window');
  var url = 'http://localhost' + (port ? (':' + port) : '') + '/';
  gui.Window.open(url, windowConfig);

});