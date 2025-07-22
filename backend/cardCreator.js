const pool = require('./db');

async function fetchAssets(difficulty = 'begginer') {
  try {
    const result = await pool.query('SELECT * FROM assets');
    console.log(result.rows); 
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

module.exports = fetchAssets();
