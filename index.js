var fs = require('fs');
var program = require('commander');
var _ = require('underscore');

var hostsFile = process.platform == "linux" ? "/etc/hosts/" : "C:\\Windows\\System32\\drivers\\etc\\hosts";

 var readHosts = function(callback) {
    fs.readFile(hostsFile, function(error, hosts) {
      if(error) {
        console.log('error reading hosts file: ' + hostsFile);
        console.log(error);
        return ;
      }
      var blockedLocation, before, after;

      if(callback) {
        hosts = hosts.toString();
        blockedLocation = hosts.indexOf("#blocked");
        
        if(blockedLocation == -1) {
          before = hosts;
          after = "#blocked off\n";
        } else {
          before = hosts.substring(0,blockedLocation);
          after = hosts.substring(blockedLocation);
        }
        callback(before, after);
      }
    });
  };

  var writeHosts = function(before, after, callback) {
    fs.writeFile(hostsFile, before + after, function(error) {
      if(error) {
        console.log('error writing hosts file: ' + hostsFile);
        console.log(error);
        return ;
      }
      if(callback) {
        callback();
        // console.log(before, after);
      }
    });
  };


var init = function() {
  program
    .version('0.0.1')
    .option('status', "return the current status of the workblocker")
    .option('start', "uncomment the hosts file")
    .option('stop', "comment the blocked sites")
    .option('add [domen]', "add domain to block list")
    .option('remove [value]', "remove one or more domains from list")
    .option('list', 'list blocked domains');

  program.on('stop', function() {
    readHosts(function(before, after) {
      if(after.indexOf('#blocked off') == -1) {
        after = after.replace('#blocked on', "#blocked off");
        after = after.replace(/127/g, '#127');
        writeHosts(before, after, function() {
          console.log('working mode stopped');
        });
      } else {
        console.log('already stopped');
      }
    });
  });

  program.on('start', function() {
    readHosts(function(before, after) {
      if(after.indexOf('#blocked on') == -1) {
        after = after.replace('#blocked off', "#blocked on");
        after = after.replace(/#127/g, '127');

        writeHosts(before, after, function() {
          console.log('working mode started');
        });
      } else {
        console.log('already running...');
      }
    });
  });

  program.on('status', function() {
    readHosts(function(before, after) {
      if(after.indexOf('#blocked on') != -1) {
        console.log('work mode running');
      } else {
        console.log('work mode stopped');
      }
    });
  });

  program.on('add', function() {
    readHosts(function(before, after) {
      if(after.indexOf(' ' + program.add) !== -1) {
        console.log('domain ' + program.add + ' already exists');
      } else {
        var address = "127.0.0.1";
        if(after.indexOf('#blocked off') !== -1) {
          address = "#" + address;
        }
        
        after = after + "\n" + address + " " + program.add;
        writeHosts(before, after, function() {
          console.log('domain ' + program.add + ' successfully added.');
        });
      }
    });
  });
  var list = function(callback) {
    readHosts(function(before, after) {
      var afterLines = after.split('\n');
      var siteLines = _.filter(afterLines, function(line) {
        return line.indexOf('127.0.0.1') != -1;
      });
      _.each(siteLines, function(site, index) {
        console.log('[' + (index+1) + '] ' + site.split(' ')[1]);
      });
      if(callback) {
        callback(before, after);
      }
    });
  };

  program.on('remove', function() {
    if(program.remove !== true) {
      removeSite(program.remove);
    } else {
      list(function() {
        program.prompt('enter site number or site name you want to remove: ', function(remove){
          removeSite(remove);
        });
      });
    }
  });

  var removeSite = function(remove) {
    readHosts(function(before, after) {
      var number = parseInt(remove, 10);
      var afterLines = after.split('\n');
      var settings = afterLines[0];
      var siteLines = _.filter(afterLines, function(line) {
        return line.indexOf('127.0.0.1') != -1;
      });
      // console.log(remove);
      if(_.isNaN(number)) {
        siteLines = _.reject(siteLines, function(site) {
          if(site.indexOf(remove) != -1) {
            console.log('site removed: ' + site.split(" ")[1]);
            return true;
          }
        });
      } else {
        siteLines = _.reject(siteLines, function(site, index) {
          if(index == (number-1)) {
            console.log('site removed: ' + site.split(" ")[1]);
            return true;
          }
        });
      }
      writeHosts(before, settings+'\n\n' + siteLines.join('\n'), function(){
        process.exit();
      });
    });
  };

  program.on('list', list);



  program.parse(process.argv);

};
  


exports.init = init;