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

## Local Development Workflow
1. Start Hardhat node: `npm run chain:dev`.
2. Deploy contracts with tagged scripts: `npx hardhat run scripts/deploy-core.ts --network localhost`.
3. Seed sample data: `npx hardhat run scripts/mint-book.ts --network localhost`.
4. Launch frontend workspace: `npm run dev --workspace frontend`.
5. Iterate using Viem hooks and React Query; maintain hot reload compatibility.

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
