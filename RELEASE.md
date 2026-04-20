# Release Process

Releases are published to [npmjs.com](https://www.npmjs.com/package/@cperfect/crock32) via a manual GitHub Actions workflow using [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC). No long-lived npm tokens are required.

## One-time setup

### ✅ Repo configuration (done)

The following have already been committed to the repository:

- `.github/workflows/02-release.yml` — the release workflow, triggerable manually from `main` only
- `package.json` — `repository` field (required by npm trusted publishing to verify publish origin) and `publishConfig.access=public` (required for scoped packages to publish publicly)

### ✅ First publish (done)

The package exists on npmjs.com and is publicly available.

### ✅ Trusted publishing configured on npmjs.com (done)

GitHub Actions trusted publisher configured for this repo and workflow.

### ✅ Release environment created on GitHub (done)

The `release` environment exists with a required reviewer approval gate.

### ✅ Token-based publishing disabled (done)

The package on npmjs.com is configured to require 2FA and disallow tokens.

---

## Publishing a new release

Run these steps from a clean `main` branch.

### 1. Bump the version

```bash
npm version patch   # 0.1.0 → 0.1.1  (bug fixes)
npm version minor   # 0.1.0 → 0.2.0  (new features)
npm version major   # 0.1.0 → 1.0.0  (breaking changes)
```

This updates `package.json`, creates a commit, and creates a git tag (e.g. `v0.1.1`).

### 2. Push the commit and tag

```bash
git push && git push --tags
```

### 3. Trigger the release workflow

1. Go to the repo on GitHub → **Actions** → **Release**
2. Click **Run workflow** → select branch `main` → **Run workflow**
3. When the job reaches the approval gate, review and **approve** it

The workflow will then lint, test, build, create a GitHub release with auto-generated notes, and publish to npm.
