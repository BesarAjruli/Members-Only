require('dotenv').config()

const {Pool} = require('pg')

const pool = new Pool({
    connectionString: process.env.DTABASE_URL
  });

  module.exports = pool