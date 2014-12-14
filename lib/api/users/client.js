/* global supervisor */
supervisor
  .bridge('users', 'getUser')
  .bridge('users', 'login')
  .bridge('users', 'save')
  .bridge('users', 'register');
