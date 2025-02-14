import { Router } from 'express';
import { pool } from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import crypto from 'crypto';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../controllers/role.middleware.js';

const router = Router();

// get route
router.get('/', verifyJWT, checkRole(['user', 'admin']), async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? 'SELECT * FROM gadgets WHERE status = $1' : 'SELECT * FROM gadgets';
        const values = status ? [status] : [];

        const { rows } = await pool.query(query, values);

        // Get server's timezone
        const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Map gadgets and format timestamps
        const gadgetsWithProbability = rows.map(gadget => ({
            ...gadget,
            missionSuccessProbability: (Math.random() * 100).toFixed(2) + "%", // Random probability
            created_at: new Date(gadget.created_at).toLocaleString('en-US', { timeZone: serverTimeZone }),
            updated_at: new Date(gadget.updated_at).toLocaleString('en-US', { timeZone: serverTimeZone }),
            decommissioned_at: gadget.decommissioned_at
                ? new Date(gadget.decommissioned_at).toLocaleString('en-US', { timeZone: serverTimeZone })
                : null
        }));

        res.json(gadgetsWithProbability);

    } catch (error) {
        console.error("Error Fetching Gadgets: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



//post route
router.post('/', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        const { name, status } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({ error: "Gadget name is required" });
        }

        let randomCodename;
        let isDuplicate = true;

        // Keep generating a unique codename until a non-duplicate is found
        while (isDuplicate) {
            randomCodename = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals], // Example: "Brave-Blue-Wolf"
                separator: ' ',
                style: 'capital'
            });

            // Check if codename already exists in the database
            const checkQuery = `SELECT codename FROM gadgets WHERE codename = $1`;
            const { rowCount } = await pool.query(checkQuery, [randomCodename]);

            if (rowCount === 0) {
                isDuplicate = false; // Exit loop if unique
            }
        }

        // Insert into PostgreSQL database
        const query = `
            INSERT INTO gadgets (id, name, codename, status)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [uuidv4(), name, randomCodename, status || 'Available'];

        const { rows } = await pool.query(query, values);

        res.status(201).json(rows[0]); 

    } catch (error) {
        console.error("Error Adding Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//put route
router.patch('/:identifier', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);

        const { name, status } = req.body;

        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const column = isUUID ? 'id' : 'codename';

        const checkQuery = `SELECT * FROM gadgets WHERE ${column} = $1`;
        const { rows } = await pool.query(checkQuery, [identifier]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        const fields = [];
        const values = [];
        let index = 1;

        if (name) {
            fields.push(`name = $${index++}`);
            values.push(name);
        }
        if (status) {
            fields.push(`status = $${index++}`);
            values.push(status);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'At least one field (name or status) must be provided' });
        }

        fields.push(`updated_at = NOW()`);
        values.push(identifier);

        const updateQuery = `UPDATE gadgets SET ${fields.join(', ')} WHERE ${column} = $${index} RETURNING *`;
        const { rows: updatedRows } = await pool.query(updateQuery, values);

        const gadget = updatedRows[0];

        // Automatically detect and format timestamps based on the server's timezone
        const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        gadget.created_at = new Date(gadget.created_at).toLocaleString('en-US', { timeZone: serverTimeZone });
        gadget.updated_at = new Date(gadget.updated_at).toLocaleString('en-US', { timeZone: serverTimeZone });

        res.json(gadget);

    } catch (error) {
        console.error("Error Updating Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//delete route
router.delete('/:identifier', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier); // decode special characters

        // Determine if identifier is a UUID or codename
        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const column = isUUID ? 'id' : 'codename';

        // Check if the gadget exists
        const checkQuery = `SELECT * FROM gadgets WHERE ${column} = $1`;
        const { rows } = await pool.query(checkQuery, [identifier]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        // Update gadget status to "Decommissioned" and add timestamp
        const updateQuery = `
            UPDATE gadgets 
            SET status = 'Decommissioned', decommissioned_at = NOW()
            WHERE ${column} = $1 
            RETURNING *;
        `;
        const { rows: updatedRows } = await pool.query(updateQuery, [identifier]);
        
        const gadget = updatedRows[0];

        const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        gadget.created_at = new Date(gadget.created_at).toLocaleString('en-US', { timeZone: serverTimeZone });
        gadget.updated_at = new Date(gadget.updated_at).toLocaleString('en-US', { timeZone: serverTimeZone });
        gadget.decommissioned_at = new Date(gadget.decommissioned_at).toLocaleString('en-US', { timeZone: serverTimeZone });
        
        res.json(updatedRows[0]); 

    } catch (error) {
        console.error("Error Decommissioning Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

 
//self destruct route
router.post('/:identifier/self-destruct', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier); // Decode special characters

        // Check if identifier is a UUID
        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const column = isUUID ? 'id' : 'codename';

        // Find gadget by id or codename
        const checkQuery = `SELECT * FROM gadgets WHERE ${column} = $1`;
        const { rows } = await pool.query(checkQuery, [identifier]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        const confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        const updateQuery = `
            UPDATE gadgets 
            SET status = 'Destroyed', updated_at = NOW() 
            WHERE ${column} = $1 
            RETURNING *`;

        const { rows: updatedRows } = await pool.query(updateQuery, [identifier]);

        res.json({
            message: 'Self-destruct sequence initiated',
            confirmationCode,
            gadget: updatedRows[0]
        });

    } catch (error) {
        console.error("Error triggering self-destruct: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router;



