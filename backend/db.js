// db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fitness',
    password: '1234',
    port: 5432, // default PostgreSQL port
    idleTimeoutMillis: 30000
});

module.exports = pool;
