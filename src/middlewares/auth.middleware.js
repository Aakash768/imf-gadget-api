import jwt from 'jsonwebtoken';
import { pool } from '../db/index.js'; 
import dotenv from 'dotenv';

dotenv.config();


// const verifyJWT = async (req, res, next) => {
//     try {
//         // Extract token from request
//         const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
//         if (!token) return res.status(401).json({ error: "Unauthorized request" });

//         // Verify JWT
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         } catch (error) {
//             return res.status(401).json({ error: "Invalid or expired token" });
//         }

//         // Fetch user from PostgreSQL
//         const { rows } = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [decodedToken.id]);
//         if (!rows.length) {
//             return res.status(401).json({ error: "Invalid access token" });
//         }
        

//         req.user = rows[0]; // Attach user to req
//         next(); // Move to next middleware
//     } catch (error) {
//         return res.status(500).json({ error: "Server error in authentication" });
//     }
// };



const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "Unauthorized request" });

        // Verify JWT
        let decodedToken;
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined!");
            }
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // Fetch user from PostgreSQL
        const { rows } = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [decodedToken._id]);
        if (!rows.length) return res.status(401).json({ error: "Invalid access token" });

        req.user = rows[0]; // Attach user to req
        next(); // Move to next middleware
    } catch (error) {
        return res.status(500).json({ error: "Server error in authentication" });
    }
};

export { verifyJWT };


