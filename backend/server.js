const express = require('express');
const cors = require('cors');
const { calculateSmoothedOverallSimilarity } = require('./poseMatcher');
const bcrypt = require('bcrypt');
const pool = require('./db');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const fetchAssets = require('./fetchAssets');
const checkAuthRoute = require('./routes/checkAuth'); 
const pg = require('pg')

const app = express();
const port = 5000;
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(checkAuthRoute);


app.get('/', (req, res) => {
  res.send('Pose Matching Server is running');
});



app.post('/receive-coords', async (req, res) => {
  console.log('=== RECEIVE-COORDS DEBUG START ===');
  console.log('Request timestamp:', new Date().toISOString());
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Exercise name:', req.body.name);
  console.log('Pose data length:', req.body.pose?.length);
  console.log('Target coordinates length:', req.body.targetCoordinates?.length);
  
  try {
    const types = pg.types;
    types.setTypeParser(1009, (val) => val.slice(1, -1).split(',')); 

    console.log('Querying database for exercise:', req.body.name);
    
    const queryResult = await pool.query(
      'SELECT important FROM assets WHERE name = $1',
      [req.body.name]
    );

    console.log('Database query result:', queryResult.rows);
    
    const impParts = queryResult.rows[0]?.important || [];
    console.log('Important parts:', impParts);

    // Validate input data
    if (!req.body.pose || !Array.isArray(req.body.pose) || req.body.pose.length === 0) {
      console.error('Invalid or missing pose data');
      return res.status(400).json({ 
        error: 'Invalid pose data', 
        similarity: 0,
        corrections: []
      });
    }

    if (!req.body.targetCoordinates || !Array.isArray(req.body.targetCoordinates) || req.body.targetCoordinates.length === 0) {
      console.error('Invalid or missing target coordinates');
      return res.status(400).json({ 
        error: 'Invalid target coordinates', 
        similarity: 0,
        corrections: []
      });
    }

    console.log('Calling calculateSmoothedOverallSimilarity...');
    console.log('Live pose sample (first 3 points):', req.body.pose.slice(0, 3));
    console.log('Target coordinates sample (first 3 points):', req.body.targetCoordinates.slice(0, 3));

    // Calculate similarity using the fixed function
    const result = calculateSmoothedOverallSimilarity(
      { pose: req.body.pose },
      req.body.targetCoordinates,
      impParts
    );

    console.log('Similarity calculation result:', result);

    // Prepare response
    const response = {
      similarity: result.similarity || 0,
      corrections: result.corrections || [],
      raw: result.raw || 0,
      isStable: result.isStable || false
    };

    console.log('Sending response:', response);
    console.log('=== RECEIVE-COORDS DEBUG END ===\n');

    res.status(200).json(response);
    
  } catch (error) {
    console.error('=== ERROR IN RECEIVE-COORDS ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    console.error('=== END ERROR ===\n');
    
    res.status(500).json({ 
      error: 'Failed to calculate similarity', 
      similarity: 0,
      corrections: [],
      details: error.message 
    });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const result = await pool.query(
      'SELECT password FROM users WHERE email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = result.rows[0].password;
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Password matched, generate tokens
    const accessToken = jwt.sign(
      { email: username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { email: username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000 * 30
    });

    await pool.query('BEGIN');

    await pool.query(
      `INSERT INTO tokens (username, refresh_token, issued_at, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
      [username, refreshToken]
    );

    await pool.query('COMMIT');

    return res.status(200).json({ success: true, message: 'Login successful!', accessToken });

  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

app.post('/signup', async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password and email are required' });
  }

  const client = await pool.connect(); // Get a dedicated client for transaction

  try {
    await client.query('BEGIN'); // Start transaction

    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    await client.query(
      'INSERT INTO users (email, password, username) VALUES ($1, $2, $3)',
      [email, hashedPass, username]
    );

    const accessToken = jwt.sign(
      { email: username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { email: username },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    await client.query(
      `INSERT INTO tokens (username, refresh_token, issued_at, expires_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')`,
      [email, refreshToken]
    );

    await client.query('COMMIT'); 

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Signup successful!',
      accessToken
    });

  } catch (err) {
    await client.query('ROLLBACK'); // Roll back all queries if any fail

    if (err.code === '23505') {
    return res.status(409).json({ error: 'Email or username already exists' });
  }
    console.error('Transaction failed:', err);
    return res.status(500).json({ error: 'Signup failed due to database error' });

  } finally {
    client.release(); 
  }
});


app.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.jwt;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Optional: Validate token exists in DB (token reuse detection)
    const result = await pool.query(
      'SELECT * FROM tokens WHERE refresh_token = $1 AND username = $2',
      [refreshToken, decoded.email] // decoded.email was stored in token
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: 'Token expired logout' });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '15m' }
    );

    return res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});


app.get('/workouts', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const assets = await fetchAssets(); 

    return res.status(200).json({ assets: assets });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
});



app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});