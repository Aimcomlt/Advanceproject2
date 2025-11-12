# Contributing to Literary Sovereignty Blueprint

We welcome contributions from authors, readers, engineers, and strategists. This document outlines the expected workflow for proposing and landing changes.

## Code of Conduct
Participation in this project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before engaging with the community.

## Getting Started
1. Review the [Developer Guide](docs/dev-guide.md) for environment setup and standards.
2. Join the StoryDAO discussion channels to coordinate efforts.
3. Search existing issues and discussions before filing new ones.

## Branching & Workflow
- Fork the repository and create a feature branch prefixed with the relevant panel (e.g., `panel-craft/<feature>`).
- Keep commits focused and descriptive. Use conventional commit prefixes when possible (`feat:`, `fix:`, `docs:`).
- Rebase against `develop` to keep the commit history linear.

## Development Checklist
- [ ] Implement or update tests covering your change.
- [ ] Run `npm run lint` and `npm run test`.
- [ ] Update documentation and changelog entries when functionality changes.
- [ ] Verify deployment scripts and ABIs if contract interfaces are modified.

## Submitting Pull Requests
1. Ensure your branch passes CI and local checks.
2. Provide a concise summary, linked issues, and testing evidence in the PR description.
3. Tag relevant panel leads or guardians for review.
4. Address review feedback promptly; prefer follow-up commits over force pushes once reviews start.

## Security Disclosures
Please report security vulnerabilities via the private security contact listed in the repository metadata. Do not open public issues for vulnerabilities.

## Community Contributions
- **Documentation:** Improve `/docs` assets, add tutorials, or translate guides.
- **Tooling:** Enhance CLI utilities, monitoring scripts, or developer ergonomics.
- **Frontend UX:** Submit design proposals, accessibility improvements, and usability research.

Thank you for helping shape Literary Sovereignty!
