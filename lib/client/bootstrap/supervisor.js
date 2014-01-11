var Supervisor = require('../supervisor');

var appFrame = document.getElementById('app');

var supervisor = new Supervisor(appFrame);

// Load default app
supervisor.loadApp();
