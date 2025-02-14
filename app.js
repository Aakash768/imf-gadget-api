import express from 'express';
import dotenv from 'dotenv';
import gadgetRoutes from './src/routes/gadget.routes.js';
import userRoutes from './src/routes/users.routes.js'; 
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"))
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("API is running");
});

app.use('/api/v1/gadgets', gadgetRoutes);
app.use('/api/v1/users', userRoutes);
export default app;