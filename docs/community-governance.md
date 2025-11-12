# Community Governance Guidelines

**Document Version:** 1.0.0  \\
**Last Updated:** 2024-06-04

These guidelines codify how the StoryDAO community collaborates, proposes changes, and exercises oversight of the Literary Sove
reignty Blueprint. They complement the on-chain timelock rules and off-chain community standards.

---

## 1. Governance Bodies

| Body | Composition | Responsibility |
| --- | --- | --- |
| **StoryDAO Token Holders** | All wallets holding `AuthorCoin` or governance NFTs. | Vote on proposals, elect working group leads, and ratify treasury use. |
| **Council of Curators** | 7 elected members serving 6-month terms. | Curate lore expansions, steward creative grants, and sponsor proposals. |
| **Guardian Multisig** | 3-of-5 signers appointed by the DAO. | Execute emergency actions (pause, cancel timelock) under incident protocol. |
| **Working Groups** | Self-organised squads (dev, ops, community, treasury). | Deliver roadmap items, publish quarterly reports, and maintain documentation. |

---

## 2. Participation Principles

1. **Transparency** – All proposals, budgets, and votes must be posted in the forum at least 5 days before on-chain submission.
2. **Inclusivity** – Encourage first-time contributors with mentorship and translation support.
3. **Accountability** – Working groups publish KPIs and retro reports every quarter.
4. **Conflict of Interest Disclosure** – Proposal authors disclose financial or employment relationships relevant to their propos
   al.

---

## 3. Proposal Lifecycle

1. **Idea Stage**
   - Share the concept in the `#governance-ideas` Discord channel with a short template (objective, impact, budget).
   - Collect community feedback for at least 72 hours.

2. **Specification Stage**
   - Draft a formal proposal using the StoryDAO SIP template (Summary, Motivation, Specification, Security Considerations).
   - Post to the governance forum under the appropriate category (Protocol, Treasury, Community).
   - Include links to relevant code branches, audits, and deployment manifests.

3. **Review Stage**
   - Council of Curators assigns two reviewers to provide feedback within 3 days.
   - Proposal authors must respond to all blocker comments before moving forward.

4. **On-Chain Vote**
   - Queue the proposal via `scripts/propose-upgrade.ts` or `scripts/propose-treasury.ts` depending on scope.
   - Voting period lasts 5 days with a 5% quorum requirement and simple majority approval.

5. **Execution & Reporting**
   - After successful vote and timelock delay, execute the proposal.
   - Publish a post-execution report summarising outcomes, funds spent, and follow-up actions.

---

## 4. Treasury Management

- Treasury disbursements above 5% of quarterly budget require a Council co-sponsor.
- Multisig signers rotate quarterly with a staggered replacement schedule to maintain continuity.
- Stablecoin holdings should remain between 40–60% of total treasury value; deviations trigger an automatic rebalancing proposal.
- All grant recipients must submit milestone-based invoices with on-chain payment references.

---

## 5. Dispute Resolution

1. **Mediation** – Members raise interpersonal conflicts to the Community Working Group for mediation within 7 days.
2. **Appeal** – If mediation fails, escalate to the Council of Curators for binding resolution (simple majority vote).
3. **Code of Conduct Violations** – Report breaches via `conduct@storydao.org`; the Conduct Committee may issue warnings, tempor
   ary suspensions, or removal from governance roles.
4. **Emergency Removal** – In the event of gross misconduct, the Guardian Multisig can immediately suspend a member pending a DA
   O vote within 14 days.

---

## 6. Documentation & Transparency

- Maintain an up-to-date governance calendar in `docs/governance-calendar.md` with meeting times and proposal deadlines.
- Publish treasury dashboards and KPI reports monthly.
- Record meeting minutes and upload to the forum within 48 hours of each governance call.
- Archive all governance-related assets (recordings, slides, spreadsheets) in the shared StoryDAO drive with public read access.

---

## 7. Continuous Improvement

- Conduct semi-annual governance reviews to assess quorum thresholds, role effectiveness, and participation metrics.
- Propose amendments to this document through the standard proposal lifecycle; tag the forum post with `governance-update`.
- Encourage contributors to submit retrospective feedback via the quarterly contributor survey.

Adhering to these guidelines ensures StoryDAO remains community-led, resilient, and aligned with the literary sovereignty missio
n.
