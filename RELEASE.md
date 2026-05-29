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

All changes — including version bumps — go through a PR. Releases only ever happen from `main`. The release workflow reads the version from `package.json` and creates the matching `vX.Y.Z` tag itself; never push tags from your local machine.

### 1. Open a release PR with the version bump

From an up-to-date `main`:

```bash
git switch main && git pull
git switch -c release/vX.Y.Z   # fill in the target version

npm version patch --no-git-tag-version   # 0.1.0 → 0.1.1  (bug fixes)
npm version minor --no-git-tag-version   # 0.1.0 → 0.2.0  (new features)
npm version major --no-git-tag-version   # 0.1.0 → 1.0.0  (breaking changes)
```

`--no-git-tag-version` updates `package.json` and `package-lock.json` only — no commit, no tag.

```bash
git add package.json package-lock.json
git commit -m "chore(release): vX.Y.Z"
git push -u origin release/vX.Y.Z
gh pr create --fill
```

### 2. Merge the PR

Wait for CI (`Validate`) to pass, get the PR reviewed, and merge it into `main`.

### 3. Trigger the release workflow

1. Switch to `main` on GitHub (the workflow refuses to run from anywhere else).
2. Go to **Actions** → **Release** → **Run workflow** → branch `main` → **Run workflow**.
3. When the job reaches the approval gate, review and **approve** it.

The workflow will lint, test, build, create the `vX.Y.Z` tag + GitHub release with auto-generated notes, and publish to npm.
