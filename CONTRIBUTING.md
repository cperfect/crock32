# Contributing

We are open to, and grateful for, any contributions made by the community. By contributing to axios, you agree to abide by the [code of conduct](https://github.com/axios/axios/blob/master/CODE_OF_CONDUCT.md).

## Git Workflow
This repository uses Trunk-Based Development using the default branch `main`. Changes should be divided into consistent working sets (e.g. a complete feature, fix, chore or related set of fixes, chores) on a branch based off `main` and a PR raised.

## Code Style

Please follow the [node style guide](https://github.com/felixge/node-style-guide), with the exception that the maximum line length is 120 characters rather than 80.

## Commit Messages

Please follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)

## Testing

Please update the tests to reflect your code changes. Pull requests will not be accepted if they are failing on GitHub actions.

## Developing

- `npm run test` runs the jasmine and mocha tests
- `npm run build` runs rollup and bundles the source

## Running Examples

```bash
npx ts-node src/examples/human-readable-ids.ts
```
