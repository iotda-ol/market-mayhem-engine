# Contributing to Market Mayhem Engine

Thank you for considering a contribution to **Market Mayhem Engine**! This document outlines the process for reporting bugs, requesting features, and submitting code changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Development Setup](#development-setup)
- [Branching & Commit Conventions](#branching--commit-conventions)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct

Please be respectful and constructive in all interactions. We expect contributors to treat each other with kindness and professionalism.

---

## Reporting Bugs

1. Search [existing issues](../../issues) to avoid duplicates.
2. Open a new issue with the **Bug** label.
3. Include:
   - A clear, descriptive title
   - Steps to reproduce the problem
   - Expected vs. actual behaviour
   - Node.js version, OS, and any relevant environment details
   - Minimal code snippet or test case if possible

---

## Requesting Features

1. Search [existing issues](../../issues) for similar requests.
2. Open a new issue with the **Enhancement** label.
3. Describe:
   - The motivation or use case
   - The proposed API or behaviour change
   - Any alternatives you considered

---

## Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/<your-fork>/market-mayhem-engine.git
cd market-mayhem-engine

# 2. Install dependencies
npm install

# 3. Run the full test suite to confirm a clean baseline
npm test

# 4. Build the project
npm run build

# 5. Run the linter
npm run lint
```

---

## Branching & Commit Conventions

| Branch prefix | Purpose |
|---------------|---------|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `docs/` | Documentation only |
| `refactor/` | Code refactor without behaviour change |
| `test/` | New or updated tests |
| `chore/` | Build, CI, or tooling changes |

**Commit messages** follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

Examples:

```
feat(encounter): add bribe mechanic to pay resolution
fix(market): clamp prices correctly when volatility > 1
docs(readme): add architecture diagram
test(engine): cover game-over edge case in resolveEncounter
```

---

## Code Style

- All code is written in **TypeScript** with `strict: true`.
- Use `const` / `let` — never `var`.
- Keep functions small and focused; avoid side effects where possible.
- Prefer explicit types over inference for public API surfaces.
- Run `npm run lint` before committing and resolve all warnings.

---

## Testing

- All new features **must** include corresponding tests.
- All bug fixes **must** include a regression test.
- Tests live in `tests/` and use [Jest](https://jestjs.io/) with `ts-jest`.
- Aim to keep overall coverage above 90 %.

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run a single test file
npm test -- tests/engine.test.ts

# Watch mode
npm test -- --watch
```

When writing tests, follow the existing patterns in the test files:

- Group related tests with `describe()` blocks.
- Use descriptive `it()` / `test()` names that read like sentences.
- Reset state between tests — avoid shared mutable state.

---

## Submitting a Pull Request

1. **Create a branch** from `main` using the appropriate prefix (e.g., `feat/new-loadout`).
2. **Make your changes** with atomic commits.
3. **Ensure all tests pass**: `npm test`
4. **Ensure linting passes**: `npm run lint`
5. **Update documentation** — if you changed the public API, update `README.md`.
6. **Open a PR** against `main` with:
   - A clear title following the commit convention
   - A description explaining *what* changed and *why*
   - A reference to any related issue (e.g., `Closes #42`)
7. Respond to review feedback promptly.

---

Thank you for helping make Market Mayhem Engine better! 🚀
