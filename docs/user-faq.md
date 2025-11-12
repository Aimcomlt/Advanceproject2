# StoryDAO User FAQ

**Document Version:** 1.0.0  \\
**Last Updated:** 2024-06-04

This FAQ answers common questions from readers, creators, and token holders interacting with the StoryDAO ecosystem. For techni
cal troubleshooting or advanced governance topics, refer to `docs/dev-guide.md` and `docs/community-governance.md`.

---

## General

**Q: What is StoryDAO?**  \
A: StoryDAO is a community-owned platform for creating and funding collaborative fiction universes using blockchain-based govern
ance and treasury management.

**Q: Which networks are supported?**  \
A: The protocol currently operates on Ethereum mainnet with test deployments on Sepolia. A local Hardhat network is available fo
r experimentation.

**Q: Do I need cryptocurrency experience to participate?**  \
A: Basic familiarity with wallets helps, but onboarding guides walk you through installing a wallet, acquiring test tokens, and
 voting on proposals.

---

## Accounts & Wallets

**Q: How do I create a wallet?**  \
A: Install a wallet such as MetaMask or Rabby, create a new account, and securely store the seed phrase offline. Follow the setu
p wizard and never share your recovery phrase.

**Q: Can I use a hardware wallet?**  \
A: Yes. Connect Ledger or Trezor devices via the wallet provider and ensure contract approvals are reviewed on-device before sig
ning.

**Q: What if I lose my private key?**  \
A: For security reasons, private keys cannot be recovered. Transfer governance tokens to a new wallet as soon as possible if you
 suspect compromise.

---

## Tokens & Treasury

**Q: How do I acquire AuthorCoin?**  \
A: Participate in StoryDAO launches, earn grants for creative contributions, or purchase from supported exchanges once listed. F
or testnet, use the faucet linked in the onboarding guide.

**Q: What utility does AuthorCoin provide?**  \
A: Holding AuthorCoin grants voting power, access to exclusive lore drops, and eligibility for seasonal reward distributions.

**Q: How are treasury funds used?**  \
A: Treasury expenditures are approved through DAO governance. Budgets typically cover creator grants, platform development, and
 community programs.

---

## Governance Participation

**Q: How do I submit a proposal?**  \
A: Draft your idea using the SIP template, gather feedback in Discord, and submit through the governance portal. Detailed steps
are outlined in `docs/community-governance.md`.

**Q: What is the voting process?**  \
A: After a proposal is live, token holders sign votes using their wallets. Once quorum and majority thresholds are met, the prop
osal queues in the timelock and executes after the mandated delay.

**Q: Can I delegate my votes?**  \
A: Yes. Use the delegation interface in the governance portal or call `AuthorCoin.delegate(<address>)` directly from a wallet or
 block explorer.

---

## Frontend & Product

**Q: How do I report a bug?**  \
A: Submit an issue via the in-app feedback widget or open a ticket in the `#support` Discord channel with steps to reproduce, sc
reenshots, and wallet address.

**Q: Why can't I connect my wallet?**  \
A: Ensure your wallet network matches the app's selected network, refresh the page, and verify that your browser allows wallet e
xtensions. For persistent issues, clear cache or use an incognito window.

**Q: Where can I track story progress?**  \
A: Visit the `Lore Hub` section of the app for timelines, voting outcomes, and contributor spotlights. Long-form updates are als
o posted in the monthly StoryDAO newsletter.

---

## Support

- Browse the knowledge base at [docs.storydao.org](https://docs.storydao.org).
- Email `support@storydao.org` for account-specific issues.
- Join weekly community calls (listed in the governance calendar) for live Q&A.

For urgent security concerns, follow the Incident Response Playbook in `docs/operations/playbooks.md` and notify the Guardian Mu
ltisig immediately.
