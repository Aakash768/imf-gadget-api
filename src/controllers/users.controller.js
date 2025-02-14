import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { pool } from '../db/index.js';


const usernameRegex = /^[a-zA-Z0-9._]{3,16}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


const registerUser = async (req, res) => {
    try {
        // Extract username and password from request body
        const { username, password } = req.body;

        // Check if fields are empty
        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({ error: "Username and Password are required" });
        }

        // Validate username with regex
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: "Username must be 3-16 characters long, alphanumeric, and can include underscores and dots, no space" });
        }

        // Validate password with regex
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character" });
        }

        // Check if the username already exists
        const userCheckQuery = `SELECT * FROM users WHERE username = $1`;
        const { rows: existingUser } = await pool.query(userCheckQuery, [username]);

        if (existingUser.length > 0) {
            return res.status(409).json({ error: "Username already exists" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database with default role 'user'
        const insertQuery = `
            INSERT INTO users (username, password, role) 
            VALUES ($1, $2, 'user') RETURNING id, username, role, created_at`;
        const { rows: newUser } = await pool.query(insertQuery, [username, hashedPassword]);

        if (!newUser.length) {
            return res.status(500).json({ error: "Error creating user" });
        }

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser[0]
        });

    } catch (error) {
        console.error("Error Registering User: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        // Find the user by username
        const { rows } = await pool.query('SELECT id, username, password, role FROM users WHERE username = $1', [username]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "User doesn't exist" });
        }

        const user = rows[0];

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Generate JWT token
        const accessToken = jwt.sign({ _id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Exclude password before sending response
        delete user.password;

        return res
            .status(200)
            .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
            .json({ message: "User logged in successfully", user, accessToken });

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
        .clearCookie("accessToken") // Clear the access token
        .json({ message: "User logged out successfully" });
};



export { loginUser, registerUser, logoutUser };
