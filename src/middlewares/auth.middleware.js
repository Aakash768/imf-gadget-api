import jwt from 'jsonwebtoken';
import prisma from '../../prisma/prisma.js';
import dotenv from 'dotenv';

dotenv.config();

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return res.status(401).json({ error: "Unauthorized request" });

        let decodedToken;
        try {
            if (!process.env.JWT_SECRET) {
                throw new Error("JWT_SECRET is not defined!");
            }
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // Fetch user from Prisma
        const user = await prisma.user.findUnique({
            where: { id: decodedToken._id },
            select: { id: true, username: true, role: true }
        });

        if (!user) return res.status(401).json({ error: "Invalid access token" });

        req.user = user; // Attach user to req
        next();
    } catch (error) {
        return res.status(500).json({ error: "Server error in authentication" });
    }
};

export { verifyJWT };