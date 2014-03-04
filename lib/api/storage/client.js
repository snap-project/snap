
function appStorageHook(args) {
  // Retrieve current app
  var currentApp = this.getCurrentApp();
  // Insert current app into arguments
  args.splice(2, 0, currentApp);
}

supervisor.bridge('appStorage', 'get', appStorageHook);
supervisor.bridge('appStorage', 'put', appStorageHook);
supervisor.bridge('appStorage', 'del', appStorageHook);
supervisor.bridge('appStorage', 'putShared', appStorageHook);
supervisor.bridge('appStorage', 'getShared', appStorageHook);
supervisor.bridge('appStorage', 'delShared', appStorageHook);
supervisor.bridge('appStorage', 'find', appStorageHook);
supervisor.bridge('appStorage', 'findShared', appStorageHook);
supervisor.bridge('appStorage', 'batch', appStorageHook);
supervisor.bridge('appStorage', 'batchShared', appStorageHook);