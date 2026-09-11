import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/api/clinics', (req, res) => {
  res.json({
    message: 'Clinics endpoint',
    status: 'not yet implemented'
  });
});

app.post('/api/match', (req, res) => {
  res.json({
    message: 'Matching engine endpoint',
    status: 'not yet implemented'
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
