/* global supervisor */
supervisor
  .proxy('system', 'getNetworkAddresses')
  .proxy('system', 'getServerExternalURL');