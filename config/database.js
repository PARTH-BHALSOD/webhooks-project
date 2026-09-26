const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require("mongoose");

const connect = () => {
  return mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
          console.log("db connected.");
      })
      .catch((err) => {
          console.log("error while connection", err);
      });
}

module.exports = connect;
