const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '/.env') });
const cron = require('node-cron')
const async = require('async');
const request = require('request')
const influx = require(path.join(__dirname, './model'));

var pm2Data = function () {
  return new Promise((resolve, reject) => {
    request({
      method: "GET",
      url: `http://${process.env.PM2_IP}:9615/`
    }, function (error, response, body) {
      if (error) {
        reject();
      } else if (response && response.statusCode == 200) {
        resolve(body);
      } else {
        console.log("Did not get any response!");
        reject();
      }
    });
  });
};

pm2Data().then(function (pm2Response) {
  let pm2DataResponse = JSON.parse(pm2Response);
  async.map(pm2DataResponse.processes, (process, callback) => {
    if (process) {
      let influx_input = {};
      influx_input['measurement'] = 'pm2-node';
      influx_input['tags'] = {
        "host": process.name || null
      };
      influx_input['fields'] = {
        "NAME": process.name || null,
        "CPU": process.monit.cpu || 0,
        "MEM": process.monit.memory || 0,
        "PROCESS_ID": process.pid || 0,
        "STATUS": (process.pm2_env.status == "online") ? 1 : 0
      };
      callback(null, influx_input);
    } else {
      callback("Error", null);
    }
  }, (err, result) => {
    if (err) {
      console.log("Err :: ", err);
    } else {
      influx.writePoints(result)
        .then(() => {
          console.log(JSON.stringify(result));
        }).catch(err => console.error(`write point fail,  ${err.message}`));
    }
  });
}, function (rejectedValue) {
  console.log("rejectedValue :: ", rejectedValue);
}).catch((err) => {
  console.log(err);
});