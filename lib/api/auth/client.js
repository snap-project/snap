/* global supervisor */
supervisor
  .bridge('auth', 'login')
  .bridge('auth', 'logout')
  .bridge('auth', 'getUser')
  .bridge('auth', 'register');
