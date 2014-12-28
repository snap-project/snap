/* global supervisor */
supervisor
  .bridge('users', 'getUser')
  .bridge('users', 'login')
  .bridge('users', 'register')
  .bridge('users', 'changeNickname')
;
