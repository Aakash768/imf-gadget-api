import { connectDB } from "./src/db/index.js";
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({
    path: "./.env"
});


connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Port is running on: ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(error)
})
