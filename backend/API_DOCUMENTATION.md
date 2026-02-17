# HyperStream Backend API Documentation

Documentation des endpoints REST pour les interfaces employeur et employé.

## Configuration

**Base URL**: `http://localhost:3001/api`

**Smart Contract**: StreamManager à l'adresse `0xd210d75702836ea5c13457d064045f39d253A235` sur Monad Testnet (Chain ID: 10143)

**RPC URL**: `https://testnet-rpc.monad.xyz`

---

## Endpoints pour l'Interface Employeur

### 1. Créer des milestones pour un stream

Permet à l'employeur de définir une roadmap de milestones pour un stream.

**Requête**:

```http
POST /api/streams/:streamId/milestones
Content-Type: application/json

{
  "milestones": [
    {
      "title": "Setup development environment",
      "description": "Install dependencies and configure tooling",
      "order": 1
    },
    {
      "title": "Implement core features",
      "description": "Build main functionality",
      "order": 2
    },
    {
      "title": "Testing and deployment",
      "description": "Write tests and deploy",
      "order": 3
    }
  ]
}
```

**Réponse** (200 OK):

```json
{
  "success": true,
  "count": 3
}
```

**Erreurs**:

- `400` - Milestones array manquant ou vide
- `500` - Erreur serveur/database

---

### 2. Récupérer tous les streams créés par un employeur

Liste tous les streams où l'address spécifiée est le sender.

**Requête**:

```http
GET /api/employer/:address/streams
```

**Exemple**:

```http
GET /api/employer/0xB2bF6fa34580AF4641f6ff5A4804De85F8204450/streams
```

**Réponse** (200 OK):

```json
[
  {
    "streamId": "1",
    "sender": "0xB2bF6fa34580AF4641f6ff5A4804De85F8204450",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "deposit": "10000000000000000000",
    "tokenAddress": "0x0000000000000000000000000000000000000000",
    "startTime": "1708200000",
    "stopTime": "1708286400",
    "ratePerSecond": "115740740740740",
    "remainingBalance": "5000000000000000000"
  }
]
```

---

### 3. Récupérer les proof of work d'un stream

Liste tous les proof of work soumis par l'employé pour un stream donné.

**Requête**:

```http
GET /api/streams/:streamId/proofs
```

**Exemple**:

```http
GET /api/streams/1/proofs
```

**Réponse** (200 OK):

```json
[
  {
    "id": 1,
    "stream_id": 1,
    "employee_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "title": "Completed milestone 1",
    "description": "Setup complete, PR merged",
    "proof_url": "https://github.com/user/repo/pull/42",
    "milestone_index": 1,
    "created_at": "2026-02-17T20:30:00.000Z"
  },
  {
    "id": 2,
    "stream_id": 1,
    "employee_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "title": "Progress update",
    "description": "50% done with core features",
    "proof_url": "https://github.com/user/repo/commit/abc123",
    "milestone_index": 2,
    "created_at": "2026-02-17T21:15:00.000Z"
  }
]
```

---

### 4. Mettre à jour le rate d'un stream

Permet à l'employeur d'ajuster le flow rate d'un stream selon l'avancement de l'employé.

**Requête**:

```http
POST /api/streams/:streamId/update-rate
Content-Type: application/json

{
  "newRate": "200000000000000"
}
```

**Réponse** (200 OK):

```json
{
  "success": true,
  "txHash": "0xcd85afe907ed6f3768c55bbd8a8451eee04ae39c57971ca567bef1b845d3fc24"
}
```

**Erreurs**:

- `400` - newRate manquant
- `500` - Erreur transaction blockchain

---

## Endpoints pour l'Interface Employé

### 5. Soumettre un proof of work

Permet à l'employé de soumettre une preuve de travail pour montrer son avancement.

**Requête**:

```http
POST /api/proof-of-work
Content-Type: application/json

{
  "streamId": "1",
  "employeeAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "title": "Feature X implemented",
  "description": "Completed the authentication module",
  "proofUrl": "https://github.com/user/repo/pull/42",
  "milestoneIndex": 2
}
```

**Paramètres**:

- `streamId` (required): ID du stream
- `employeeAddress` (required): Adresse de l'employé
- `title` (required): Titre du proof of work
- `description` (optional): Description détaillée
- `proofUrl` (optional): Lien vers GitHub PR, commit, screenshot IPFS, etc.
- `milestoneIndex` (optional): Index du milestone complété (marque automatiquement le milestone comme complété)

**Réponse** (200 OK):

```json
{
  "success": true,
  "id": 5
}
```

**Erreurs**:

- `400` - Champs requis manquants
- `500` - Erreur database

---

### 6. Récupérer tous les streams reçus par un employé

Liste tous les streams où l'address spécifiée est le recipient.

**Requête**:

```http
GET /api/employee/:address/streams
```

**Exemple**:

```http
GET /api/employee/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/streams
```

**Réponse** (200 OK):

```json
[
  {
    "streamId": "1",
    "sender": "0xB2bF6fa34580AF4641f6ff5A4804De85F8204450",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "deposit": "10000000000000000000",
    "tokenAddress": "0x0000000000000000000000000000000000000000",
    "startTime": "1708200000",
    "stopTime": "1708286400",
    "ratePerSecond": "115740740740740",
    "remainingBalance": "5000000000000000000",
    "currentBalance": "3200000000000000000"
  }
]
```

**Note**: Inclut le `currentBalance` calculé en temps réel.

---

### 7. Récupérer la roadmap d'un stream

Affiche tous les milestones et proof of work pour un stream, avec le pourcentage de complétion.

**Requête**:

```http
GET /api/streams/:streamId/roadmap
```

**Exemple**:

```http
GET /api/streams/1/roadmap
```

**Réponse** (200 OK):

```json
{
  "milestones": [
    {
      "id": 1,
      "stream_id": 1,
      "title": "Setup development environment",
      "description": "Install dependencies and configure tooling",
      "order_index": 1,
      "is_completed": true,
      "completed_at": "2026-02-17T20:30:00.000Z"
    },
    {
      "id": 2,
      "stream_id": 1,
      "title": "Implement core features",
      "description": "Build main functionality",
      "order_index": 2,
      "is_completed": false,
      "completed_at": null
    },
    {
      "id": 3,
      "stream_id": 1,
      "title": "Testing and deployment",
      "description": "Write tests and deploy",
      "order_index": 3,
      "is_completed": false,
      "completed_at": null
    }
  ],
  "proofs": [
    {
      "id": 2,
      "stream_id": 1,
      "employee_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "title": "Progress update",
      "description": "50% done with core features",
      "proof_url": "https://github.com/user/repo/commit/abc123",
      "milestone_index": 2,
      "created_at": "2026-02-17T21:15:00.000Z"
    },
    {
      "id": 1,
      "stream_id": 1,
      "employee_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "title": "Completed milestone 1",
      "description": "Setup complete, PR merged",
      "proof_url": "https://github.com/user/repo/pull/42",
      "milestone_index": 1,
      "created_at": "2026-02-17T20:30:00.000Z"
    }
  ],
  "completionPercentage": 33
}
```

---

### 8. Récupérer le balance en temps réel

Calcule le montant disponible pour retrait à l'instant T.

**Requête**:

```http
GET /api/streams/:streamId/balance/:recipient
```

**Exemple**:

```http
GET /api/streams/1/balance/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Réponse** (200 OK):

```json
{
  "balance": "3456789012345678900",
  "formatted": "3.456789012345679"
}
```

**Note**: Le frontend doit appeler cet endpoint régulièrement (polling toutes les 1-2 secondes) pour afficher le balance en temps réel avec animation.

---

## Endpoints Utilitaires

### Health Check

Vérifier l'état du serveur et la configuration blockchain.

**Requête**:

```http
GET /api/health
```

**Réponse** (200 OK):

```json
{
  "status": "ok",
  "network": "Monad Testnet",
  "chainId": 10143,
  "contractAddress": "0xd210d75702836ea5c13457d064045f39d253A235"
}
```

---

## Smart Contract Integration

### ABI StreamManager

Le frontend peut également interagir directement avec le smart contract via Web3/Wagmi/Viem pour les fonctions suivantes :

**Fonctions principales**:

```solidity
function createStream(
    address recipient,
    uint256 deposit,
    address tokenAddress,
    uint256 startTime,
    uint256 stopTime,
    uint256 ratePerSecond
) external returns (uint256 streamId)

function withdrawFromStream(uint256 streamId, uint256 amount) external

function cancelStream(uint256 streamId) external

function balanceOf(uint256 streamId, address who) external view returns (uint256)

function getStream(uint256 streamId) external view returns (
    address sender,
    address recipient,
    uint256 deposit,
    address tokenAddress,
    uint256 startTime,
    uint256 stopTime,
    uint256 ratePerSecond,
    uint256 remainingBalance
)

function updateStreamRate(uint256 streamId, uint256 newRatePerSecond) external
```

**Événements à écouter**:

```solidity
event StreamCreated(
    uint256 indexed streamId,
    address indexed sender,
    address indexed recipient,
    uint256 deposit,
    address tokenAddress,
    uint256 startTime,
    uint256 stopTime,
    uint256 ratePerSecond
)

event StreamRateUpdated(
    uint256 indexed streamId,
    uint256 oldRate,
    uint256 newRate,
    uint256 timestamp
)

event WithdrawFromStream(
    uint256 indexed streamId,
    address indexed recipient,
    uint256 amount
)

event StreamCanceled(
    uint256 indexed streamId,
    address indexed sender,
    address indexed recipient,
    uint256 senderBalance,
    uint256 recipientBalance
)
```

---

## Modèle de Données

### Stream (Smart Contract)

```typescript
interface Stream {
  sender: string; // Adresse de l'employeur
  recipient: string; // Adresse de l'employé
  deposit: string; // Montant total déposé (wei)
  tokenAddress: string; // Adresse du token ERC20 (0x0 pour ETH/MON)
  startTime: string; // Timestamp de début (unix)
  stopTime: string; // Timestamp de fin (unix)
  ratePerSecond: string; // Rate de déblocage par seconde (wei/sec)
  remainingBalance: string; // Solde restant dans le stream (wei)
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
  created_at: string; // ISO timestamp
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
  completed_at: string | null; // ISO timestamp
}
```

---

## Calcul du Balance en Temps Réel

Pour afficher le balance qui s'incrémente chaque seconde dans le frontend, utiliser la formule :

```
Balance(t) = min(deposit, (t - startTime) × ratePerSecond)
```

Où:

- `t` = timestamp actuel (en secondes)
- `startTime` = timestamp de début du stream
- `ratePerSecond` = rate de déblocage par seconde
- `deposit` = montant total déposé

**Exemple de calcul côté frontend** (JavaScript):

```javascript
function calculateStreamBalance(stream) {
  const now = Math.floor(Date.now() / 1000); // Timestamp actuel en secondes
  const elapsed = now - parseInt(stream.startTime);
  const unlocked = BigInt(elapsed) * BigInt(stream.ratePerSecond);
  const balance =
    unlocked > BigInt(stream.deposit) ? BigInt(stream.deposit) : unlocked;
  return balance.toString();
}
```

---

## Exemples d'Utilisation (cURL)

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

### Mettre à jour le rate

```bash
curl -X POST http://localhost:3001/api/streams/1/update-rate \
  -H "Content-Type: application/json" \
  -d '{"newRate": "200000000000000"}'
```

---

## Notes pour l'Équipe Frontend

1. **Polling pour balance temps réel**: Appeler `/api/streams/:streamId/balance/:recipient` toutes les 1-2 secondes OU calculer côté client avec la formule mathématique.

2. **Gestion des montants**: Tous les montants sont en wei (18 décimales). Utiliser `ethers.formatEther()` / `ethers.parseEther()` pour la conversion.

3. **CORS**: Le serveur a CORS activé pour accepter les requêtes cross-origin du frontend.

4. **WebSocket alternative**: Pour éviter le polling, envisager d'écouter les événements smart contract via un provider WebSocket.

5. **Authentification**: Actuellement pas d'authentification sur l'API. Les adresses dans les requêtes doivent correspondre au wallet connecté côté frontend.
