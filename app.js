var Snap = require('snap-lib').Snap;
var app = new Snap();
app.startWebServer(function(err) {
  if(err) {
    app.logger.error(err.stack ? err.stack : err);
    return process.exit(1);
  }
  // Node-Webkit context -> Show home page
  if('window' in global) {
    var port = app.config.get('server:port');
    var url = 'http://localhost' + (port ? (':' + port) : '') + '/';
    global.window.location = url;
  }
});