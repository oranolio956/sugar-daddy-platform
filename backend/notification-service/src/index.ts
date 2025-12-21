import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Sugar Daddy Notification Service');
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Notification Service is running on port ${PORT}`);
});