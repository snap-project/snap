/* global supervisor */
function appStorageHook(args) {
  // Retrieve current app
  var currentApp = this.getCurrentApp();
  // Insert current app into arguments
  args.splice(2, 0, currentApp);
}

supervisor.proxy('appStorage', 'get', appStorageHook);
supervisor.proxy('appStorage', 'put', appStorageHook);
supervisor.proxy('appStorage', 'del', appStorageHook);
supervisor.proxy('appStorage', 'putShared', appStorageHook);
supervisor.proxy('appStorage', 'getShared', appStorageHook);
supervisor.proxy('appStorage', 'delShared', appStorageHook);
supervisor.proxy('appStorage', 'find', appStorageHook);
supervisor.proxy('appStorage', 'findShared', appStorageHook);
supervisor.proxy('appStorage', 'batch', appStorageHook);
supervisor.proxy('appStorage', 'batchShared', appStorageHook);
