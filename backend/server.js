require('dotenv').config(); 
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION BLOCKCHAIN ---
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ABI Simplifiée (Azioul devra te donner l'ABI complète après compilation)
const contractABI = [
    "function updateFlowRate(uint256 newRate) public",
    "function flowRate() public view returns (uint256)",
    "event FlowRateUpdated(uint256 newRate)"
];

const flowContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

// --- ENDPOINTS POUR LE FRONTEND ---

// 1. Simuler un "Commit GitHub" (Booste le flux)
app.post('/api/trigger-commit', async (req, res) => {
    try {
        console.log("🚀 Commit detected ! Flow augmentation...");
        const currentRate = await flowContract.flowRate();
        const newRate = currentRate + BigInt(100); // On ajoute 100 unités/sec
        
        const tx = await flowContract.updateFlowRate(newRate);
        await tx.wait(); // On attend la confirmation sur Monad (très rapide !)
        
        res.json({ success: true, txHash: tx.hash, newRate: newRate.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Ajustement manuel via le Slider
app.post('/api/set-rate', async (req, res) => {
    const { rate } = req.body;
    try {
        console.log(`🎛️ flow parameter : ${rate}`);
        const tx = await flowContract.updateFlowRate(rate);
        res.json({ success: true, txHash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Statut actuel
app.get('/api/status', async (req, res) => {
    try {
        const rate = await flowContract.flowRate();
        res.json({ rate: rate.toString() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🔥 Bridge Master actif sur le port ${PORT}`));


// mode chaos qui simule plusieurs bridge master
// Fonction utilitaire pour attendre (delay)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let isChaosRunning = false;

async function runChaosMode(iterations = 10) {
    if (isChaosRunning) return;
    isChaosRunning = true;
    console.log("🌀 CHAOS MODE ACTIVATED");

    for (let i = 0; i < iterations; i++) {
        try {    
            // Génère un flowRate aléatoire entre 50 et 500
            const randomRate = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
            console.log(`🎲 Variation Chaos [${i+1}/${iterations}] : Nouveau rate = ${randomRate}`);
            
            // Envoi de la transaction
            const tx = await flowContract.updateFlowRate(randomRate);
            
            // On n'attend pas forcément la confirmation complète pour montrer le débit, 
            // mais on attend un petit peu entre deux vagues
            await sleep(1500); 
        } catch (error) {
            console.error("Erreur pendant le Chaos:", error.message);
        }
    }

    isChaosRunning = false;
    console.log("✅ Mode Chaos terminé.");
}

// Endpoint pour déclencher la démo automatique -> bouton caché julie
app.post('/api/chaos', async (req, res) => {
    if (isChaosRunning) {
        return res.status(400).json({ message: "Le chaos est déjà en cours !" });
    }
    
    // On lance la fonction en arrière-plan (sans await ici pour répondre vite au front)
    runChaosMode(15); 
    
    res.json({ success: true, message: "Séquence de démonstration lancée !" });
});