import express from 'express';
import { connectDB } from './db/connectDB.js';
import authRoute from './routes/auth.route.js';
const app = express();

const PORT = process.env.PORT || 5000;
import dotenv from 'dotenv';

dotenv.config();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use('/api/v1/auth', authRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port`, PORT);
});
