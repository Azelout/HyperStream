# HyperStream Backend

Backend Express.js pour le protocole de **streaming de paiements continus** (pay-per-second) sur la blockchain **Monad Testnet**.

## 🎯 Contexte : Hackathon Monad

**Objectif** : Développer un protocole de streaming de paiements continus avec un cas d'usage **Payroll** (flux de paie pour employeurs/employés).

**Architecture** : Pull-based linear streaming avec calcul mathématique dynamique du montant débloqué en fonction du temps.

**Formule** :

```
Balance(t) = min(deposit, (t - startTime) × ratePerSecond)
```

---

## 🏗️ Architecture Technique

### Stack

- **Backend** : Node.js + Express.js
- **Blockchain** : Monad Testnet (Chain ID: 10143)
- **Smart Contract** : StreamManager ([IStreamManager.sol](contracts/interfaces/IStreamManager.sol))
- **Database** : SQLite (sql.js) pour données off-chain
- **Web3** : ethers.js v6

### Smart Contract

- **Adresse** : `0xd210d75702836ea5c13457d064045f39d253A235`
- **RPC** : `https://testnet-rpc.monad.xyz`
- **Modèle** : Pull-based (les utilisateurs interagissent avec le contrat pour retirer ou annuler)

### Base de Données (SQLite)

**Tables** :

1. **`proof_of_work`** : Proof of work soumis par les employés
   - `stream_id`, `employee_address`, `title`, `description`, `proof_url`, `milestone_index`, `created_at`

2. **`milestones`** : Roadmap des milestones définis par l'employeur
   - `stream_id`, `title`, `description`, `order_index`, `is_completed`, `completed_at`

---

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec votre PRIVATE_KEY
```

### Configuration (`.env`)

```env
RPC_URL=https://testnet-rpc.monad.xyz
PRIVATE_KEY=your_private_key_here
STREAM_MANAGER_ADDRESS=0xd210d75702836ea5c13457d064045f39d253A235
PORT=3001
DB_PATH=./db/hyperstream.db
```

### Lancer le serveur

```bash
node server.js
```

Le serveur démarre sur **http://localhost:3001**

---

## 📡 API Endpoints

### 🏢 Interface Employeur

#### 1. **Créer des milestones pour un stream**

```http
POST /api/streams/:streamId/milestones
```

Définit une roadmap de milestones pour suivre l'avancement de l'employé.

**Body** :

```json
{
  "milestones": [
    { "title": "Setup environment", "description": "...", "order": 1 },
    { "title": "Core features", "description": "...", "order": 2 }
  ]
}
```

#### 2. **Récupérer tous les streams créés**

```http
GET /api/employer/:address/streams
```

Liste tous les streams où l'adresse est le `sender`.

#### 3. **Récupérer les proof of work d'un stream**

```http
GET /api/streams/:streamId/proofs
```

Liste tous les proof of work soumis par l'employé pour un stream donné.

#### 4. **Mettre à jour le rate d'un stream**

```http
POST /api/streams/:streamId/update-rate
```

Ajuste le flow rate selon l'avancement de l'employé.

**Body** :

```json
{
  "newRate": "200000000000000"
}
```

---

### 👷 Interface Employé

#### 5. **Soumettre un proof of work**

```http
POST /api/proof-of-work
```

Permet à l'employé de soumettre une preuve de travail (GitHub PR, commit, screenshot).

**Body** :

```json
{
  "streamId": "1",
  "employeeAddress": "0x...",
  "title": "Feature X implemented",
  "description": "Completed authentication module",
  "proofUrl": "https://github.com/...",
  "milestoneIndex": 2
}
```

> **Note** : Si `milestoneIndex` est fourni, le milestone correspondant est automatiquement marqué comme complété.

#### 6. **Récupérer tous les streams reçus**

```http
GET /api/employee/:address/streams
```

Liste tous les streams où l'adresse est le `recipient`. Inclut le `currentBalance` calculé en temps réel.

#### 7. **Récupérer la roadmap d'un stream**

```http
GET /api/streams/:streamId/roadmap
```

Affiche tous les milestones, proof of work, et le pourcentage de complétion.

#### 8. **Récupérer le balance en temps réel**

```http
GET /api/streams/:streamId/balance/:recipient
```

Calcule le montant disponible pour retrait à l'instant T.

**Réponse** :

```json
{
  "balance": "3456789012345678900",
  "formatted": "3.456789012345679"
}
```

---

### 🔧 Utilitaires

#### **Health Check**

```http
GET /api/health
```

Vérifie l'état du serveur et la configuration blockchain.

**Réponse** :

```json
{
  "status": "ok",
  "network": "Monad Testnet",
  "chainId": 10143,
  "contractAddress": "0xd210d75702836ea5c13457d064045f39d253A235"
}
```

---

## 🧮 Fonctionnalités Principales

### 1. **Gestion des Streams**

- Récupération des streams via événements blockchain (`StreamCreated`)
- Calcul en temps réel du balance débloqué (pull-based)
- Support ETH/MON natif et tokens ERC20

### 2. **Système de Milestones**

- Création de roadmap par l'employeur
- Suivi de complétion avec timestamps
- Calcul automatique du pourcentage d'avancement

### 3. **Proof of Work**

- Soumission de preuves par l'employé (URLs GitHub, IPFS, etc.)
- Association automatique aux milestones
- Historique complet des submissions

### 4. **Modulation du Rate**

- L'employeur peut ajuster le `ratePerSecond` selon la performance
- Transaction on-chain via `updateStreamRate`
- Événement `StreamRateUpdated` émis

### 5. **Base de Données Off-Chain**

- Persistance SQLite pour éviter les requêtes blockchain coûteuses
- Auto-sauvegarde après chaque mutation
- Initialisation automatique des tables au démarrage

---

## 🔗 Intégration Smart Contract

Le frontend peut interagir directement avec le smart contract via Web3/Wagmi/Viem pour :

### Fonctions principales

```solidity
createStream(recipient, deposit, tokenAddress, startTime, stopTime, ratePerSecond)
withdrawFromStream(streamId, amount)
cancelStream(streamId)
balanceOf(streamId, who)
getStream(streamId)
updateStreamRate(streamId, newRatePerSecond)
```

### Événements à écouter

```solidity
event StreamCreated(uint256 indexed streamId, ...)
event StreamRateUpdated(uint256 indexed streamId, ...)
event WithdrawFromStream(uint256 indexed streamId, ...)
event StreamCanceled(uint256 indexed streamId, ...)
```

---

## 📊 Modèles de Données

### Stream (Smart Contract)

```typescript
interface Stream {
  sender: string; // Adresse employeur
  recipient: string; // Adresse employé
  deposit: string; // Montant total (wei)
  tokenAddress: string; // Token ERC20 ou 0x0 pour ETH
  startTime: string; // Timestamp début (unix)
  stopTime: string; // Timestamp fin (unix)
  ratePerSecond: string; // Rate (wei/sec)
  remainingBalance: string; // Solde restant (wei)
}
```

### ProofOfWork (Database)

```typescript
interface ProofOfWork {
  id: number;
  stream_id: number;
  employee_address: string;
  title: string;
  description: string;
  proof_url: string;
  milestone_index: number | null;
  created_at: string;
}
```

### Milestone (Database)

```typescript
interface Milestone {
  id: number;
  stream_id: number;
  title: string;
  description: string;
  order_index: number;
  is_completed: boolean;
  completed_at: string | null;
}
```

---

## 🎨 Notes Frontend

1. **Balance temps réel** : Appeler `/api/streams/:streamId/balance/:recipient` toutes les 1-2 secondes OU calculer côté client avec :

   ```javascript
   const now = Math.floor(Date.now() / 1000);
   const elapsed = now - parseInt(stream.startTime);
   const balance = BigInt(elapsed) * BigInt(stream.ratePerSecond);
   ```

2. **Gestion des montants** : Tous les montants sont en wei (18 décimales). Utiliser `ethers.formatEther()` / `ethers.parseEther()`.

3. **CORS** : Activé pour accepter les requêtes cross-origin.

4. **WebSocket alternative** : Pour éviter le polling, écouter les événements smart contract via un provider WebSocket.

5. **Authentification** : Pas d'authentification API. Les adresses doivent correspondre au wallet connecté côté frontend.

---

## 📁 Structure du Projet

```
HyperStream/
├── backend/              # (Réservé pour structure future)
├── contracts/            # Smart contracts Solidity
│   ├── interfaces/
│   │   └── IStreamManager.sol
│   ├── libraries/
│   │   └── StreamMath.sol
│   └── StreamManager.sol
├── frontend/             # Frontend React + Vite
├── db/                   # Base SQLite (généré au runtime)
│   └── hyperstream.db
├── server.js             # Serveur Express principal
├── .env                  # Variables d'environnement (gitignored)
├── .env.example          # Template de configuration
├── API_DOCUMENTATION.md  # Documentation détaillée API
└── README.md             # Ce fichier
```

---

## 🧪 Exemples d'Utilisation (cURL)

### Créer des milestones

```bash
curl -X POST http://localhost:3001/api/streams/1/milestones \
  -H "Content-Type: application/json" \
  -d '{
    "milestones": [
      {"title": "Setup", "description": "Initial setup", "order": 1},
      {"title": "Development", "description": "Core dev", "order": 2}
    ]
  }'
```

### Soumettre un proof of work

```bash
curl -X POST http://localhost:3001/api/proof-of-work \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "1",
    "employeeAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "title": "Feature complete",
    "description": "Authentication module done",
    "proofUrl": "https://github.com/...",
    "milestoneIndex": 1
  }'
```

### Récupérer le balance

```bash
curl http://localhost:3001/api/streams/1/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

---

## 📚 Documentation Complète

Pour une documentation détaillée de tous les endpoints avec exemples de réponses, voir [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

---

## 🔐 Sécurité

- Les transactions blockchain sont signées avec la `PRIVATE_KEY` configurée dans `.env`
- **⚠️ IMPORTANT** : Ne jamais commit le fichier `.env` dans Git
- Utiliser un wallet de test sur Monad Testnet
- Les retraits et annulations sont protégés par les règles du smart contract

---

## 🛠️ Développement

### Tests

```bash
# Tests backend (à implementer)
npm test

# Tests smart contract (avec Foundry)
cd contracts
forge test
```

### Lancement avec Frontend

```bash
# Terminal 1 : Backend
node server.js

# Terminal 2 : Frontend
cd frontend
npm run dev
```

---

## 📝 License

MIT

---

## 🤝 Contribution

Projet développé pour le **Hackathon Monad**.
