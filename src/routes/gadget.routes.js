import { Router } from 'express';
import prisma from '../../prisma/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import crypto from 'crypto';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkRole } from '../controllers/role.middleware.js';

const router = Router();

// Get route
router.get('/', verifyJWT, checkRole(['user', 'admin']), async (req, res) => {
    try {
        const { status } = req.query;
        
        const gadgets = status
            ? await prisma.gadget.findMany({ where: { status } })
            : await prisma.gadget.findMany();

        const serverTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const gadgetsWithProbability = gadgets.map(gadget => ({
            ...gadget,
            missionSuccessProbability: (Math.random() * 100).toFixed(2) + "%",
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

// Post route
// POST Route: Add a New Gadget
router.post('/', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        const { name, status } = req.body;

        if (!name) {
            return res.status(400).json({ error: "Gadget name is required" });
        }

        let randomCodename;
        let isDuplicate = true;

        while (isDuplicate) {
            randomCodename = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals],
                separator: ' ',
                style: 'capital'
            });

            const existingGadget = await prisma.gadget.findUnique({ where: { codename: randomCodename } });
            if (!existingGadget) isDuplicate = false;
        }

        const newGadget = await prisma.gadget.create({
            data: {
                id: uuidv4(),
                name,
                codename: randomCodename,
                status: status || 'Available'
            }
        });

        res.status(201).json(newGadget);
    } catch (error) {
        console.error("Error Adding Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PATCH Route: Update Gadget
router.patch('/:identifier', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);

        const { name, status } = req.body;

        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const whereCondition = isUUID ? { id: identifier } : { codename: identifier };

        const existingGadget = await prisma.gadget.findUnique({ where: whereCondition });
        if (!existingGadget) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        const updatedGadget = await prisma.gadget.update({
            where: whereCondition,
            data: {
                name: name || existingGadget.name,
                status: status || existingGadget.status,
                updatedAt: new Date().toISOString()// ✅ Fixed timestamp handling
            }
        });

        res.json(updatedGadget);
    } catch (error) {
        console.error("Error Updating Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Patch route
router.patch('/:identifier', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);

        const { name, status } = req.body;

        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const whereCondition = isUUID ? { id: identifier } : { codename: identifier };

        const existingGadget = await prisma.gadget.findUnique({ where: whereCondition });
        if (!existingGadget) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        const updatedGadget = await prisma.gadget.update({
            where: whereCondition,
            data: {
                name: name || existingGadget.name,
                status: status || existingGadget.status,
                updated_at: new Date()
            }
        });

        res.json(updatedGadget);
    } catch (error) {
        console.error("Error Updating Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete route
router.delete('/:identifier', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);

        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const whereCondition = isUUID ? { id: identifier } : { codename: identifier };

        const existingGadget = await prisma.gadget.findUnique({ where: whereCondition });
        if (!existingGadget) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        const updatedGadget = await prisma.gadget.update({
            where: whereCondition,
            data: {
                status: 'Decommissioned',
                decommissioned_at: new Date()
            }
        });

        res.json(updatedGadget);
    } catch (error) {
        console.error("Error Decommissioning Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Self-destruct route
router.post('/:identifier/self-destruct', verifyJWT, checkRole(['admin']), async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);

        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const whereCondition = isUUID ? { id: identifier } : { codename: identifier };

        const existingGadget = await prisma.gadget.findUnique({ where: whereCondition });
        if (!existingGadget) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        const confirmationCode = crypto.randomBytes(3).toString('hex').toUpperCase();

        const updatedGadget = await prisma.gadget.update({
            where: whereCondition,
            data: {
                status: 'Destroyed',
                updated_at: new Date()
            }
        });

        res.json({
            message: 'Self-destruct sequence initiated',
            confirmationCode,
            gadget: updatedGadget
        });
    } catch (error) {
        console.error("Error triggering self-destruct: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
