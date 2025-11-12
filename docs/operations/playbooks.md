# Operational Playbooks

**Document Version:** 1.0.0  \\
**Last Updated:** 2024-06-04

This document extends the production runbook with concrete, repeatable playbooks for deployment, upgrade coordination, and incid
ent response. Each playbook references the shared scripts under `scripts/` and manifests in `deployments/`.

---

## Deployment Playbook

**Objective:** Promote a new StoryDAO release to the target network with deterministic artefacts and audit-ready logging.

1. **Change Approval**
   - Confirm the pull request has been approved by at least two core maintainers.
   - Verify the changelog entry in `docs/CHANGELOG.md` matches the scope of the release.

2. **Pre-flight Checks**
   - Run `npm run lint` and `npm run test` from the monorepo root.
   - Execute security scans: `npm run audit:slither` and `npx hardhat coverage`.
   - Snapshot the current deployment manifest: `cp deployments/<network>.json deployments/archive/<date>-pre.json`.

3. **Parameterisation**
   - Populate environment variables described in `docs/operations/production-runbook.md` for the target network (RPC URL, DAO a
     dmins, treasury, oracle, etc.).
   - Run `npm run config:validate -- --network <network>` to ensure addresses are well-formed.

4. **Execution**
   ```bash
   npx hardhat run scripts/deploy-core.ts --network <network>
   npx hardhat run scripts/deploy-timelock.ts --network <network>  # if missing
   ```
   - Monitor the console output for transaction hashes and addresses.
   - Upon success, the manifest under `deployments/<network>.json` and frontend artefacts under `frontend/lib/contracts/<network
     >.json` update automatically.

5. **Verification**
   - Run `npx hardhat verify --network <network> <address> <constructor args>` for each new contract.
   - Execute smoke tests against the target network: `npm run test:smoke --workspace frontend -- --network <network>`.

6. **Post-Deployment**
   - Update the change-management record with block numbers, verification links, and the manifest diff.
   - Announce completion in the #ops channel with links to the governance proposal and explorer transactions.

---

## Upgrade Playbook

**Objective:** Roll out contract upgrades via StoryDAO governance while preserving timelock guarantees.

1. **Prepare Implementation**
   - Merge the new contract logic into `main` and ensure `scripts/upgrade-logic.ts` exports the upgrade routine.
   - Run `npx hardhat compile` to generate bytecode and ABI.

2. **Generate Upgrade Bundle**
   ```bash
   npx hardhat run scripts/prepare-upgrade.ts --network <network> --target <ContractName>
   ```
   - The script writes an entry to `deployments/<network>.json#upgrades` with the expected implementation address and calldata.

3. **Governance Proposal Draft**
   - Use `scripts/propose-upgrade.ts` to produce the calldata for StoryDAO.
   - Share the draft on the governance forum including:
     - Implementation address
     - Timelock delay window
     - Rollback plan and invariant checks

4. **Queue & Execute**
   - Once the proposal passes, queue it through the timelock: `scripts/queue-upgrade.ts`.
   - After the delay, execute via `scripts/execute-upgrade.ts`.
   - Observe contract events using `cast logs` to confirm the beacon or proxy pointed to the new implementation.

5. **Post-Upgrade Validation**
   - Re-run targeted tests against the live network (`npm run test:post-upgrade --workspace frontend -- --network <network>`).
   - Confirm invariants (supply caps, treasury balances) via `cast call` scripts located in `scripts/checks/`.
   - Record proposal ID, execution transaction hash, and validation notes in the upgrade log (`docs/operations/upgrade-log.md`).

---

## Incident Response Playbook

**Objective:** Provide a coordinated response to security or stability incidents impacting the protocol or frontend.

1. **Detection & Triage**
   - Alerts originate from PagerDuty, Grafana, or community reports.
   - Incident commander (IC) acknowledges within 5 minutes and opens an incident ticket.

2. **Stabilisation**
   - If contracts are affected:
     - Freeze upgrades by cancelling pending timelock operations (`scripts/cancel-timelock.ts`).
     - If funds are at risk, execute the emergency pause routine in `AuthorCoin` via `scripts/emergency-pause.ts` (requires DAO
       role or emergency council authority).
   - If frontend compromised:
     - Disable static hosting via provider dashboard and redeploy a known-good commit.
     - Rotate API keys stored in `frontend/.env.production` secrets manager.

3. **Communication**
   - Post status updates every 30 minutes in #incident Slack and mirror to the community Discord announcements channel.
   - Escalate to legal/comms if user funds are impacted.

4. **Forensics & Remediation**
   - Capture on-chain state diffs (`scripts/dump-state.ts --network <network>`) and logs for later analysis.
   - Patch the vulnerability in a dedicated hotfix branch; follow the Deployment Playbook with heightened approvals (three sign
     offs).

5. **Postmortem**
   - Within 48 hours, publish a retrospective including root cause, remediation steps, and follow-up tasks.
   - Update `docs/operations/production-runbook.md` and this playbook to incorporate lessons learned.

---

## Reference Artefacts

- `docs/operations/production-runbook.md` – baseline operational controls.
- `scripts/` – executable helpers referenced throughout.
- `deployments/` – manifests synchronised with the frontend and historical archives.
- `docs/operations/incident-log.md` – create/update per-incident summaries (one file per incident).
