/* global supervisor */
supervisor
  .bridge('apps', 'getAppManifest')
  .bridge('apps', 'getAppsList');