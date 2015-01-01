/* global supervisor */
supervisor
  .proxy('users', 'getUser')
  .proxy('users', 'login')
  .proxy('users', 'register')
  .proxy('users', 'changeNickname')
;
