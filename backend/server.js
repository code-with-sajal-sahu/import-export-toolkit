import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';
import userRoutes from './src/routes/userRoutes.js';
dotenv.config();

connectDB();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/uploads', express.static('public/uploads'));
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
