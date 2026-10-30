# Contributing to AgentSentinel

Welcome! We are excited that you want to contribute to **AgentSentinel**, the zero-trust runtime security firewall for AI agents and Model Context Protocol (MCP).

Whether you are fixing a typo, adding documentation, authoring security rule presets, or contributing core detectors, your contributions are deeply appreciated.

---

## 🌟 Where to Start

If you are a newcomer or looking for quick tasks to contribute to, check out our curated issues:
- [Good First Issues](https://github.com/sparkysolutions10-pixel/agentsentinel/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- [Help Wanted Issues](https://github.com/sparkysolutions10-pixel/agentsentinel/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
- [Documentation Issues](https://github.com/sparkysolutions10-pixel/agentsentinel/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation)

---

## 📋 The 4-Step Contribution Flow

1. **Find an Unassigned Issue:**
   Browse the open issues. If an issue is unassigned, you are welcome to take it!
2. **Comment to Get Assigned:**
   Leave a polite comment on the issue:
   > *"Hi maintainer, I would like to work on this issue. Please assign it to me!"*
   Our maintainers typically review and assign within a few hours.
3. **Develop & Test:**
   Fork the repository, clone your fork, create a feature branch, and write tests for your changes.
4. **Submit a Pull Request:**
   Open a PR targeting the `main` branch. In your PR description, include `Closes #<issue-number>`. Once CI passes, maintainers will review and merge promptly!

---

## 🛠️ Local Development Setup

Prerequisites: Node.js 18+ and npm.

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/agentsentinel.git
cd agentsentinel

# 2. Install dependencies
npm install

# 3. Run test suite
npm test

# 4. Build TypeScript
npm run build
```

---

## ✅ Pull Request Checklist

Before submitting your pull request, please verify:
- [ ] `npm test` runs cleanly and all tests pass (100% green).
- [ ] `npm run build` compiles with zero TypeScript errors.
- [ ] New features include corresponding unit tests in the `tests/` directory.
- [ ] Pull request body includes `Closes #XYZ` linking to the assigned issue.

Thank you for helping make autonomous AI agents safer for everyone! 🛡️
