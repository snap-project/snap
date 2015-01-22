/* jshint browser: true */
/* global supervisor */
supervisor.proxy('appStorage', 'get')
  .proxy('appStorage', 'put')
  .proxy('appStorage', 'del')
  .proxy('appStorage', 'putShared')
  .proxy('appStorage', 'getShared')
  .proxy('appStorage', 'delShared')
  .proxy('appStorage', 'find')
  .proxy('appStorage', 'findShared')
  .proxy('appStorage', 'batch')
  .proxy('appStorage', 'batchShared')
;
