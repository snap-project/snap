/* global supervisor */
supervisor
  .proxy('rtc', 'broadcast')
  .proxy('rtc', 'sendTo')
  .forward('rtc:message');
