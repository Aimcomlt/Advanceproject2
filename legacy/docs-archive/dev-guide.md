# Developer Guide

**Document Version:** 1.0.0  \\
**Last Updated:** 2024-05-29

## Prerequisites
- Node.js 18+ and npm workspaces.
- pnpm (optional) for deterministic lockfiles.
- Hardhat, Foundry (cast/anvil), and Docker for local services.
- Access to an Ethereum node provider (Alchemy, Infura, or Ankr).

## Repository Bootstrap
```bash
npm install
npm run build:types # Generate TypeChain bindings
npm run lint
npm run test
```

## Branching Strategy
- Use `main` for production-ready code, `develop` for integration, and feature branches prefixed with panel identifier (e.g., `panel-lore/reader-highlights`).
- Rebase feature branches against `develop` before submitting pull requests.

## Coding Standards
- **Solidity:** Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html); enforce via `solhint`.
- **TypeScript:** Prefer functional React components, `eslint-config-next` / `@typescript-eslint` defaults.
- **Testing:** Require deterministic fixtures and property-based fuzzing for financial primitives.
- **Documentation:** Update relevant files in `/docs/` and include version bump notes.

## Local Development Setup

### 1. Environment Bootstrap

1. **Install global dependencies**
   ```bash
   brew install foundry  # includes cast/anvil (macOS)
   npm install --global hardhat pnpm
   ```
   On Linux, prefer `foundryup` for Foundry and your distribution's package manager for Node.js 18 LTS.

2. **Clone & install workspaces**
   ```bash
   git clone git@github.com:StoryDAO/Advanceproject2.git
   cd Advanceproject2
   npm install
   ```
   Use `pnpm install` if you manage lockfiles with pnpm.

3. **Configure environment variables**
   - Copy `.env.example` to `.env`.
   - Provide RPC URLs (`SEPOLIA_RPC_URL`, `MAINNET_RPC_URL`), wallet keys (`DEV_PRIVATE_KEY`), and optional subgraph endpoints.
   - For the frontend, duplicate `frontend/.env.example` to `frontend/.env.local` and set `NEXT_PUBLIC_CHAIN_ID`, `NEXT_PUBLIC_RPC_URL`, and wallet connect IDs.

4. **Build shared artefacts**
   ```bash
   npm run build:types
   npm run lint
   ```
   TypeChain outputs populate `frontend/lib/contracts` for hooks and tests.

### 2. Contract Development Loop

1. **Start a local chain**
   ```bash
   npm run chain:dev
   ```
   This runs Hardhat's in-memory chain preloaded with deterministic accounts.

2. **Deploy core contracts**
   ```bash
   npx hardhat run scripts/deploy-core.ts --network localhost
   ```
   Deployment manifests write to `deployments/localhost.json` and expose ABIs for the frontend.

3. **Seed fixtures & scenarios**
   ```bash
   npx hardhat run scripts/mint-book.ts --network localhost
   npx hardhat run scripts/seed-governance.ts --network localhost
   ```
   Use tagged scenario scripts in `scripts/` to populate governance proposals, NFT metadata, and treasury balances.

4. **Iterate with tests**
   - Run focused tests: `npx hardhat test test/AuthorCoin.spec.ts`.
   - Use `forge test` for Foundry fuzz suites.
   - Monitor events with `cast logs --rpc-url http://127.0.0.1:8545`.

### 3. Frontend Development Loop

1. **Install workspace dependencies** (if not already done):
   ```bash
   npm install --workspace frontend
   ```

2. **Start the development server**
   ```bash
   npm run dev --workspace frontend
   ```
   The app expects contract artefacts in `frontend/lib/contracts/localhost.json`; regenerate via the deployment step when contrac
t ABIs change.

3. **Connect to the local chain**
   - Ensure the wallet (e.g., Metamask) points to `http://127.0.0.1:8545` with chain ID `31337`.
   - Import the mnemonic from `.env` or Hardhat's default test accounts for signing proposals.

4. **Hot reloading & storybook**
   - Enable React Fast Refresh for component development.
   - Run `npm run storybook --workspace frontend` for isolated UI work; provide mock Viem clients under `frontend/.storybook/moc
ks`.

5. **End-to-end checks**
   ```bash
   npm run test:e2e --workspace frontend
   ```
   This Playwright suite expects a seeded local chain; rerun seeding scripts if tests fail due to missing fixtures.

### Quick Reference Commands

| Action | Command |
| --- | --- |
| Start local Hardhat chain | `npm run chain:dev` |
| Deploy contracts to localhost | `npx hardhat run scripts/deploy-core.ts --network localhost` |
| Seed sample NFTs & governance | `npx hardhat run scripts/mint-book.ts --network localhost` |
| Launch frontend dev server | `npm run dev --workspace frontend` |
| Run Playwright smoke tests | `npm run test:e2e --workspace frontend` |

## Testing Matrix
| Layer        | Tools                  | Expectations                                   |
| ------------ | ---------------------- | ---------------------------------------------- |
| Unit         | Hardhat + Chai         | 100% branch coverage on critical contracts     |
| Integration  | Hardhat, Foundry       | Fork tests covering cross-module flows         |
| Frontend     | Playwright, Testing Lib| Web3 login, proposal voting, highlight flows   |
| Security     | Echidna, Slither       | Weekly fuzzing, static analysis, invariant logs|

## Deployment Checklist
- [ ] Update changelog and document migration steps.
- [ ] Run `npm run audit:slither` and review findings.
- [ ] Export `ABIs/` bundle for frontend integration.
- [ ] Submit governance proposal draft to StoryDAO forum.
- [ ] Coordinate multisig signers for timelock execution window.

## Observability & Ops
- Subscribe to subgraph webhook alerts for DAO events.
- Configure Grafana dashboards to monitor treasury balances.
- Utilize PagerDuty rotations for guardian responsibilities.

## Contribution Pathways
- **Core Protocol:** Focus on AuthorCoin, StoryDAO, treasury upgrades.
- **Reader Experience:** Expand frontend routes, IPFS integrations, and annotation UX.
- **Tooling:** Enhance deployment scripts, CLI utilities, and test harnesses.
- See `CONTRIBUTING.md` for detailed submission workflow.
