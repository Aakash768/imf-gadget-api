import { Router } from 'express';
import prisma from '../../prisma/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import crypto from 'crypto';
import moment from 'moment-timezone';

// get gadgets
const getGadgets = async (req, res) => {
    try {
        const { status } = req.query;
        
        const gadgets = status
            ? await prisma.gadget.findMany({ where: { status } })
            : await prisma.gadget.findMany();

        const gadgetsWithProbability = gadgets.map(gadget => ({
            ...gadget,
            missionSuccessProbability: (Math.random() * 100).toFixed(2) + "%",
            created_at: moment(gadget.createdAt).tz('Asia/Kolkata').format(),
            updated_at: moment(gadget.updatedAt).tz('Asia/Kolkata').format(),
            decommissioned_at: gadget.decommissionedAt
                ? moment(gadget.decommissionedAt).tz('Asia/Kolkata').format()
                : null
        }));

        res.json(gadgetsWithProbability);
    } catch (error) {
        console.error("Error Fetching Gadgets: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// add new gadgets
const postGadgets = async (req, res) => {
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
                status: status || 'Available',
                createdAt: moment().tz('Asia/Kolkata').toDate(),
                updatedAt: moment().tz('Asia/Kolkata').toDate()
            }
        });

        res.status(201).json(newGadget);
    } catch (error) {
        console.error("Error Adding Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// update gadgets
const updateGadgets = async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);
        console.log(`Received identifier: ${identifier}`);
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
                updatedAt: moment().tz('Asia/Kolkata').toDate()
            }
        });

        res.json(updatedGadget);
    } catch (error) {
        console.error("Error Updating Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// delete gadgets
const deleteGadgets = async (req, res) => {
    try {
        let { identifier } = req.params;
        identifier = decodeURIComponent(identifier);

        const isUUID = /^[0-9a-fA-F-]{36}$/.test(identifier);
        const whereCondition = isUUID ? { id: identifier } : { codename: identifier };

        const existingGadget = await prisma.gadget.findUnique({ where: whereCondition });
        if (!existingGadget) {
            return res.status(404).json({ error: 'Gadget not found' });
        }

        if (existingGadget.status === 'Destroyed') {
            return res.status(400).json({ error: 'Cannot decommission a destroyed gadget' });
        }

        if (existingGadget.status === 'Decommissioned') {
            return res.status(400).json({ error: 'Gadget is already decommissioned' });
        }

        const updatedGadget = await prisma.gadget.update({
            where: whereCondition,
            data: {
                status: 'Decommissioned',
                decommissionedAt: moment().tz('Asia/Kolkata').toDate()
            }
        });

        res.json(updatedGadget);
    } catch (error) {
        console.error("Error Decommissioning Gadget: ", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// self destruct
const selfDestruct = async (req, res) => {
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
                updatedAt: moment().tz('Asia/Kolkata').toDate()
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
}

export { getGadgets, postGadgets, updateGadgets, deleteGadgets, selfDestruct };