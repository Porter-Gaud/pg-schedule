var http = require('http');
var CronJob = require('cron').CronJob;

var currentWeek = 'UNKNOWN';

module.exports.currentWeek = function() {
  if (currentWeek != 'UNKNOWN') {
    return currentWeek;
  } else {
    var week = '';
    var schedulePageOptions = {
      host: 'www.portergaud.edu',
      port: 80,
      path: '/page.cfm?p=1430',
      method: 'GET'
    };

    var req = http.request(schedulePageOptions, function(res) {
      var data = '';
      res.on('data', function(d) {
        data += d;
      });
      res.on('end', function() {
        if (data.indexOf('A Week') > -1 || data.indexOf('Week A') > -1) {
          week = 'A';
        } else if (data.indexOf('B Week') > -1 || data.indexOf('Week B') > -1) {
          week = 'B';
        } else {
          week = 'WEEKEND';
        }
        currentWeek = week;
        return week;
      });
    });
    req.end();
  }
};

module.exports.currentWeek();

new CronJob('00 01 00 * * *', function() {
  console.log('Automatically updating the week...');
  currentWeek = 'UNKNOWN';
  module.exports.currentWeek();
}, null, true, 'America/New_York');

module.exports.getFutureWeek = function(month, date, year) {
  var week = '';
  var request = http.get('http://www.portergaud.edu/page.cfm?p=1346&start=' + month + '/' + date + '/' + year + '&period=week', function(response) {
    var data = '';
    response.on('end', function(d) {
      data += d;
    });
    response.on('end', function() {
      if (data.indexOf('A Week' > -1)) {
        week = 'A';
      } else if (data.indexOf('B Week' > -1)) {
        week = 'B';
      } else {
        week = 'WEEKEND';
      }
      return week;
    });
  });
};
