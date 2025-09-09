const moment = require('moment-timezone');

const getIndiaTime = () => {
  return moment().tz("Asia/Kolkata").format('DD MMM YYYY hh:mm:ss A');
};

module.exports = getIndiaTime;