# Production Operations Runbook

**Document Version:** 0.9.0  \\
**Last Updated:** 2024-04-15

This runbook consolidates the operational procedures required to bring the Literary Sovereignty Blueprint to production. It focuses on three areas:

1. Preparing and running automated security scans.
2. Establishing governance timelocks and defining emergency playbooks.
3. Executing the production deployment workflow with reproducible scripts and artefacts.

---

## 1. Automated Security Scanning

1. **Install workspace dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```
   *If the installation fails with registry restrictions (for example HTTP 403), mirror the packages locally or configure an allow-listed registry URL before retrying.*

2. **Run the repository audit script** (added to the monorepo root):
   ```bash
   npm run audit
   ```
   This wraps `npm audit --omit=dev` to limit the report to production dependencies while still surfacing vulnerable packages across every workspace.

3. **Recommended Solidity analysis** (run once contracts compile):
   ```bash
   npx hardhat compile
   npx hardhat test
   # Optional advanced scanning
   npx hardhat coverage
   ```

4. **Manual log of blocked scans**
   If scans cannot complete due to network policy, document the failing command, HTTP status, and remediation owner in the change-management record so the audit trail reflects the attempt.

---

## 2. Governance Timelock & Emergency Procedures

### 2.1 Configuration Schema

Timelock parameters are resolved from environment variables that share the network prefix (e.g. `SEPOLIA_`). Defaults are suitable for development but production values **must** be provided explicitly.

| Variable | Purpose | Notes |
| --- | --- | --- |
| `<PREFIX>_TIMELOCK_MIN_DELAY` | Minimum delay (seconds) before a queued upgrade can execute. | Defaults: 60 (local), 43,200 (testnets). |
| `<PREFIX>_TIMELOCK_ADMIN` | Address that receives administrative roles on deployment. | Required – typically the StoryDAO governor or a dedicated multisig. |
| `<PREFIX>_TIMELOCK_PROPOSERS` | Comma-separated proposer addresses. | Falls back to the admin if omitted. |
| `<PREFIX>_TIMELOCK_EXECUTORS` | Comma-separated executor addresses. | Falls back to `0x000…000` (open execution). |
| `<PREFIX>_TIMELOCK_CANCELLERS` | Addresses allowed to cancel queued operations. | Can be combined with an emergency council. |
| `<PREFIX>_EMERGENCY_COUNCIL` | Optional address granted the canceller role automatically. | Use a small multisig for break-glass authority. |

Configuration resolution is implemented in `scripts/utils/network.ts` and reused by both deployment and upgrade scripts.【F:scripts/utils/network.ts†L1-L143】

### 2.2 Deploying the Timelock Controller

1. Populate the environment variables for the target network.
2. Run the deployment script:
   ```bash
   npx hardhat run --network <network> scripts/deploy-timelock.ts
   ```
3. The script will:
   - Deploy `TimelockController` with the configured delay, proposers, and executors.【F:scripts/deploy-timelock.ts†L31-L58】
   - Grant canceller roles to the configured set and optional emergency council.【F:scripts/deploy-timelock.ts†L60-L75】
   - Persist the address and ABI to `deployments/<network>.json` and `frontend/lib/contracts/<network>.json` for the frontend.【F:scripts/deploy-timelock.ts†L77-L86】

4. After deployment:
   - Submit StoryDAO proposals to transfer `DEFAULT_ADMIN_ROLE`, `DAO_ROLE`, and other privileged roles on `UpgradeBeacon` and `UUPSManager` to the timelock.【F:contracts/proxy/UpgradeBeacon.sol†L41-L94】【F:contracts/proxy/UUPSManager.sol†L17-L125】
   - Update the deployment configuration (`DAO_ADMIN` etc.) so that subsequent core deployments immediately register the timelock as admin.【F:scripts/deploy-core.ts†L12-L83】

### 2.3 Emergency Playbook

| Scenario | Action |
| --- | --- |
| **Malicious or buggy upgrade queued** | Use the emergency council (or any canceller) to call `cancel` on the timelock before the delay expires. Ensure the incident is logged and a new proposal with a fix is queued. |
| **Unexpected proxy behaviour post-upgrade** | Execute the upgrade rollback proposal that registers the previous implementation in `UpgradeBeacon` then upgrades the proxy through `UUPSManager`. Both contracts gate upgrades behind the DAO role, ensuring the timelock delay still applies.【F:contracts/proxy/UpgradeBeacon.sol†L64-L94】【F:contracts/proxy/UUPSManager.sol†L62-L117】 |
| **Immediate halt required** | Revoke the `PROXY_ADMIN_ROLE` on `UUPSManager` for operational actors and keep only the timelock/DAO role until the issue is resolved.【F:contracts/proxy/UUPSManager.sol†L17-L118】 |
| **Oracle compromise** | Trigger a proposal (delayed by the timelock) to set a safe oracle address via `AuthorCoin.setSaleOracle` and temporarily remove the compromised executor role.【F:contracts/token/AuthorCoin.sol†L47-L117】 |

Document every emergency action in the incident response log, capturing block numbers, proposal IDs, and signers involved.

---

## 3. Production Deployment Workflow

1. **Bootstrap configuration**
   - Export `DAO_ADMIN`, `TREASURY`, `SALE_ORACLE`, and StoryDAO parameters for the target network. The helper in `scripts/utils/network.ts` reads these values at runtime.【F:scripts/utils/network.ts†L97-L130】

2. **Deploy core contracts**
   ```bash
   npx hardhat run --network <network> scripts/deploy-core.ts
   ```
   The script deploys AuthorCoin, NFTs, StoryDAO, and the upgrade management contracts, then writes a deployment manifest shared with the frontend.【F:scripts/deploy-core.ts†L1-L94】

3. **Deploy the governance timelock** (if not already on-chain)
   ```bash
   npx hardhat run --network <network> scripts/deploy-timelock.ts
   ```

4. **Queue role transfers**
   - Draft a StoryDAO proposal that grants the timelock DAO roles on `UpgradeBeacon`/`UUPSManager` and revokes deployer privileges once verified.
   - Use `scripts/upgrade-logic.ts` to stage upgrades, ensuring every invocation references a timelock-queued proposal ID via `upgradeId`.【F:scripts/upgrade-logic.ts†L1-L108】

5. **Post-deployment checks**
   - Verify contract addresses in the manifest and propagate them to the frontend via the generated JSON artefacts.【F:scripts/utils/artifacts.ts†L1-L47】
   - Run smoke tests (frontend wallet connection, proposal creation, mint simulations) on the target network.

6. **Change-management artefacts**
   - Archive the manifest, Hardhat logs, and governance proposal drafts alongside the incident response and audit logs described above.

---

Maintaining this runbook alongside the scripts ensures operational readiness, audited change history, and consistent deployment hygiene for every environment.
