/* jshint node: true, browser: true */
var Supervisor = require('../supervisor');
var appFrame = document.getElementById('app');
global.window.supervisor = new Supervisor(appFrame);