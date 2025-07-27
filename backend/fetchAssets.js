const pool = require('./db');

async function fetchAssets(difficulty = 'beginner') {
  try {
    const result = await pool.query('SELECT * FROM assets');
    const filtered = result.rows.filter(element =>
      element.id &&
      element.name &&
      element.coordinates &&
      element.image &&
      element.level
    );
    return filtered;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    return [];
  }
}

module.exports = fetchAssets;
