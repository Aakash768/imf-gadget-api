import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../../prisma/prisma.js';
import moment from 'moment-timezone';

const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const checkIfLoggedIn = (req) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET);
            return true;
        } catch (error) {
            // Token is invalid or expired, proceed with registration or login
        }
    }
    return false;
};

const registerUser = async (req, res) => {
    try {
        if (checkIfLoggedIn(req)) {
            return res.status(400).json({ error: "User is already logged in. Please log out first." });
        }

        const { username, password } = req.body;

        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({ error: "Username and Password are required" });
        }

        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: "Username must be 3-16 characters long, alphanumeric, and can include underscores and dots, no space" });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character" });
        }

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(409).json({ error: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { 
                username, 
                password: hashedPassword, 
                role: 'user',
                createdAt: moment().tz('Asia/Kolkata').toDate(),
                updatedAt: moment().tz('Asia/Kolkata').toDate()
            }
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: { id: newUser.id, username: newUser.username, role: newUser.role, created_at: newUser.createdAt }
        });
    } catch (error) {
        console.error("Error Registering User: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        if (checkIfLoggedIn(req)) {
            return res.status(400).json({ error: "User is already logged in. Please log out first." });
        }

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: "User doesn't exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const accessToken = jwt.sign({ _id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .json({ message: "User logged in successfully", user: { id: user.id, username: user.username, role: user.role }, accessToken });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const logoutUser = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User is not authenticated" });
    }

    return res
        .status(200)
        .clearCookie("accessToken")
        .json({ message: "User logged out successfully" });
};

export { loginUser, registerUser, logoutUser };