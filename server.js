require('dotenv').config(); 
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');


const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION BLOCKCHAIN ---
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet =new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI du StreamManager
const contractABI = [
    "function createStream(address recipient, uint256 deposit, address tokenAddress, uint256 startTime, uint256 stopTime, uint256 ratePerSecond) external returns (uint256)",
    "function balanceOf(uint256 streamId, address who) external view returns (uint256)",
    "function withdrawFromStream(uint256 streamId, uint256 amount) external",
    "function cancelStream(uint256 streamId) external",
    "function getStream(uint256 streamId) external view returns (address sender, address recipient, uint256 deposit, address tokenAddress, uint256 startTime, uint256 stopTime, uint256 ratePerSecond, uint256 remainingBalance)",
    "function updateStreamRate(uint256 streamId, uint256 newRatePerSecond) external",
    "event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 deposit, address tokenAddress, uint256 startTime, uint256 stopTime, uint256 ratePerSecond)",
    "event StreamRateUpdated(uint256 indexed streamId, uint256 oldRate, uint256 newRate, uint256 timestamp)",
    "event WithdrawFromStream(uint256 indexed streamId, address indexed recipient, uint256 amount)",
    "event StreamCanceled(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 senderBalance, uint256 recipientBalance)"
];

const streamContract = new ethers.Contract(process.env.STREAM_MANAGER_ADDRESS, contractABI, wallet);

// --- INITIALISATION BASE DE DONNÉES ---
const dbPath = process.env.DB_PATH || './db/hyperstream.db';
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db;

const initDB = async () => {
    const SQL = await initSqlJs();
    
    if (fs.existsSync(dbPath)) {
        const buffer = fs.readFileSync(dbPath);
        db = new SQL.Database(buffer);
    } else {
        db = new SQL.Database();
    }
    
    db.run(`
        CREATE TABLE IF NOT EXISTS proof_of_work (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stream_id INTEGER NOT NULL,
            employee_address TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            proof_url TEXT,
            milestone_index INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    db.run(`
        CREATE TABLE IF NOT EXISTS milestones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stream_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            order_index INTEGER NOT NULL,
            is_completed INTEGER DEFAULT 0,
            completed_at TEXT
        )
    `);
    
    console.log('✅ Database initialized');
};

const saveDB = () => {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
};

// --- ENDPOINTS POUR L'INTERFACE EMPLOYEUR ---

app.post('/api/streams/:streamId/milestones', (req, res) => {
    const { streamId } = req.params;
    const { milestones } = req.body;

    if (!Array.isArray(milestones) || milestones.length === 0) {
        return res.status(400).json({ error: 'Milestones array is required' });
    }

    try {
        for (const item of milestones) {
            db.run(
                'INSERT INTO milestones (stream_id, title, description, order_index) VALUES (?, ?, ?, ?)',
                [streamId, item.title, item.description || '', item.order]
            );
        }
        
        saveDB();
        res.json({ success: true, count: milestones.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employer/:address/streams', async (req, res) => {
    const { address } = req.params;

    try {
        const filter = streamContract.filters.StreamCreated(null, address);
        const events = await streamContract.queryFilter(filter);

        const streams = await Promise.all(events.map(async (event) => {
            const streamId = event.args.streamId.toString();
            const streamData = await streamContract.getStream(streamId);
            
            return {
                streamId,
                sender: streamData[0],
                recipient: streamData[1],
                deposit: streamData[2].toString(),
                tokenAddress: streamData[3],
                startTime: streamData[4].toString(),
                stopTime: streamData[5].toString(),
                ratePerSecond: streamData[6].toString(),
                remainingBalance: streamData[7].toString()
            };
        }));

        res.json(streams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/streams/:streamId/proofs', (req, res) => {
    const { streamId } = req.params;

    try {
        const stmt = db.prepare('SELECT * FROM proof_of_work WHERE stream_id = ? ORDER BY created_at DESC');
        stmt.bind([streamId]);
        
        const proofs = [];
        while (stmt.step()) {
            proofs.push(stmt.getAsObject());
        }
        stmt.free();

        res.json(proofs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/streams/:streamId/update-rate', async (req, res) => {
    const { streamId } = req.params;
    const { newRate } = req.body;

    if (!newRate) {
        return res.status(400).json({ error: 'newRate is required' });
    }

    try {
        console.log(`🎛️ Updating stream ${streamId} rate to: ${newRate}`);
        const tx = await streamContract.updateStreamRate(streamId, newRate);
        await tx.wait();

        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ENDPOINTS POUR L'INTERFACE EMPLOYÉ ---

app.post('/api/proof-of-work', (req, res) => {
    const { streamId, employeeAddress, title, description, proofUrl, milestoneIndex } = req.body;

    if (!streamId || !employeeAddress || !title) {
        return res.status(400).json({ error: 'streamId, employeeAddress, and title are required' });
    }

    try {
        const timestamp = new Date().toISOString();
        
        db.run(
            'INSERT INTO proof_of_work (stream_id, employee_address, title, description, proof_url, milestone_index, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [streamId, employeeAddress, title, description || '', proofUrl || '', milestoneIndex !== undefined ? milestoneIndex : null, timestamp]
        );

        if (milestoneIndex !== null && milestoneIndex !== undefined) {
            const completedAt = new Date().toISOString();
            db.run(
                'UPDATE milestones SET is_completed = 1, completed_at = ? WHERE stream_id = ? AND order_index = ?',
                [completedAt, streamId, milestoneIndex]
            );
        }

        saveDB();
        
        const lastIdStmt = db.prepare('SELECT last_insert_rowid() as id');
        lastIdStmt.step();
        const { id } = lastIdStmt.getAsObject();
        lastIdStmt.free();

        res.json({ success: true, id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/employee/:address/streams', async (req, res) => {
    const { address } = req.params;

    try {
        const filter = streamContract.filters.StreamCreated(null, null, address);
        const events = await streamContract.queryFilter(filter);

        const streams = await Promise.all(events.map(async (event) => {
            const streamId = event.args.streamId.toString();
            const streamData = await streamContract.getStream(streamId);
            const currentBalance = await streamContract.balanceOf(streamId, address);

            return {
                streamId,
                sender: streamData[0],
                recipient: streamData[1],
                deposit: streamData[2].toString(),
                tokenAddress: streamData[3],
                startTime: streamData[4].toString(),
                stopTime: streamData[5].toString(),
                ratePerSecond: streamData[6].toString(),
                remainingBalance: streamData[7].toString(),
                currentBalance: currentBalance.toString()
            };
        }));

        res.json(streams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/streams/:streamId/roadmap', (req, res) => {
    const { streamId } = req.params;

    try {
        const milestonesStmt = db.prepare('SELECT * FROM milestones WHERE stream_id = ? ORDER BY order_index');
        milestonesStmt.bind([streamId]);
        
        const milestones = [];
        while (milestonesStmt.step()) {
            milestones.push(milestonesStmt.getAsObject());
        }
        milestonesStmt.free();

        const proofsStmt = db.prepare('SELECT * FROM proof_of_work WHERE stream_id = ? ORDER BY created_at DESC');
        proofsStmt.bind([streamId]);
        
        const proofs = [];
        while (proofsStmt.step()) {
            proofs.push(proofsStmt.getAsObject());
        }
        proofsStmt.free();

        const completed = milestones.filter(m => m.is_completed === 1).length;
        const completionPercentage = milestones.length > 0 
            ? Math.round((completed / milestones.length) * 100)
            : 0;

        res.json({ 
            milestones, 
            proofs, 
            completionPercentage 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/streams/:streamId/balance/:recipient', async (req, res) => {
    const { streamId, recipient } = req.params;

    try {
        const balance = await streamContract.balanceOf(streamId, recipient);
        
        res.json({ 
            balance: balance.toString(),
            formatted: ethers.formatEther(balance)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- HEALTH CHECK ---
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        network: 'Monad Testnet',
        chainId: 10143,
        contractAddress: process.env.STREAM_MANAGER_ADDRESS
    });
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 3001;

initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🔥 HyperStream Backend actif sur le port ${PORT}`);
        console.log(`📄 StreamManager: ${process.env.STREAM_MANAGER_ADDRESS}`);
        console.log(`🌐 Network: Monad Testnet (Chain ID: 10143)`);
    });
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});
