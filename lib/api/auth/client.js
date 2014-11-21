/* global supervisor */
supervisor
  .bridge('auth', 'getUser')
  .bridge('auth', 'login');
