import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './db/connectDB.js';
import authRoute from './routes/auth.route.js';
import path from 'path';
const app = express();

const PORT = process.env.PORT || 5000;
import dotenv from 'dotenv';

const __dirname = path.resolve();

dotenv.config();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json()); // allow us to parse incoming json data

app.use(cookieParser()); // allow us to parse incoming  cookies
app.use('/api/v1/auth', authRoute);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/Frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'Frontend', 'dist', 'index.html'));
  });
}
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port`, PORT);
});
