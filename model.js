require('dotenv').config();
const Influx = require('influx');

const influxModel = new Influx.InfluxDB({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    schema: [
      {
        measurement: 'pm2-prod-node',
        fields: {
          NAME:Influx.FieldType.STRING,
          CPU:Influx.FieldType.FLOAT,
          MEM:Influx.FieldType.FLOAT,
          PROCESS_ID: Influx.FieldType.INTEGER,
          STATUS: Influx.FieldType.FLOAT
        },
        tags: [
          'host'
        ]
      }
    ]
  });

  module.exports = influxModel;
