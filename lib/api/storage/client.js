
function appStorageHook(args) {
  // Retrieve current app
  var currentApp = this.getCurrentApp();
  // Insert current app into arguments
  args.splice(2, 0, currentApp);
}

supervisor.bridge('appStorage', 'get', appStorageHook);
supervisor.bridge('appStorage', 'put', appStorageHook);