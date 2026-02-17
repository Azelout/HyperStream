# CONTEXTE DU PROJET : HACKATHON MONAD
Objectif : Développer un protocole de streaming de paiements continus (pay-per-second) sur la blockchain Monad. Cas d'usage : flux de paie (Payroll) ou paiement à la consommation (type Spotify).
Contraintes : Optimisation pour l'Optimistic Concurrency Control (OCC) de Monad, minimisation des transactions, exécution stateless entre la création et le retrait.

# ARCHITECTURE TECHNIQUE
* **Modèle** : Pull-based linear streaming. Le contrat ne pousse pas les fonds, les utilisateurs (sender ou recipient) interagissent avec l'état pour retirer ou annuler.
* **Modèle Mathématique** : Le montant débloqué est calculé dynamiquement en fonction du temps via la formule :
    $$Balance(t) = \min(deposit, (t - startTime) \times ratePerSecond)$$
* **Stack** : Solidity 0.8.24, Foundry (pour les tests et le fuzzing), Next.js + Wagmi/Viem (pour le frontend).
* **Structure des Smart Contracts** :
    1.  `IStreamManager.sol` : Interface stricte définissant l'ABI (Structs, Custom Errors, Events, Signatures).
    2.  `StreamManager.sol` : Implémentation du Singleton gérant le mapping global des flux et la logique de transition d'état (transferts SafeERC20).
    3.  `StreamMath.sol` : Librairie pure/stateless pour isoler et sécuriser les calculs de précision (delta temps, rate, gestion des overflows).

# ÉTAT ACTUEL
Le fichier d'interface `IStreamManager.sol` a été défini avec succès. Il inclut :
* `struct Stream { address sender; address recipient; uint256 deposit; address tokenAddress; uint256 startTime; uint256 stopTime; uint256 ratePerSecond; uint256 remainingBalance; }`
* **Custom Errors** : `ZeroAddress()`, `InvalidTimeFrame()`, `ZeroDeposit()`, `StreamDoesNotExist(streamId)`, `UnauthorizedCaller(caller)`, `ArithmeticOverflow()`.
* **Events** : `StreamCreated`, `WithdrawFromStream`, `StreamCanceled`.
* **Signatures** : `createStream`, `balanceOf`, `withdrawFromStream`, `cancelStream`, `getStream`.