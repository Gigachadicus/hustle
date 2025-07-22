const express = require('express');
const cors = require('cors');
const { calculateOverallSimilarity, calculateSimplePositionSimilarity, calculateSmoothedOverallSimilarity } = require('./poseMatcher');
const exampleModel = require('./exampleModel.json');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Pose Matching Server is running');
});

app.post('/receive-coords', (req, res) => {
  try {
    console.log('Received pose data with', req.body.pose?.length || 0, 'landmarks');

    // Calculate smoothed similarity
    const result = calculateSmoothedOverallSimilarity(req.body, exampleModel.pose);
    
    console.log('Smoothed similarity:', result.similarity.toFixed(2), '%');
    console.log('Raw comprehensive:', result.raw.comprehensive.toFixed(2), '%');
    console.log('Raw simple:', result.raw.simple.toFixed(2), '%');
    
    res.status(200).json({ 
      similarity: result.similarity,
      comprehensive: result.comprehensive,
      simple: result.simple,
      raw: result.raw
    });
  } catch (error) {
    console.error('Error calculating similarity:', error);
    res.status(500).json({ error: 'Failed to calculate similarity', similarity: 0 });
  }
});

app.listen(port, () => {
  console.log(`Pose matching server listening on http://localhost:${port}`);
});