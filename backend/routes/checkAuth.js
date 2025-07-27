const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/check-auth', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.status(200).json({ message: 'Authenticated' });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
});

module.exports = router;
