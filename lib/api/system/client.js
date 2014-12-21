/* global supervisor */
supervisor
  .bridge('system', 'getNetworkAddresses')
  .bridge('system', 'getServerExternalURL');