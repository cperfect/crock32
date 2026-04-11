const tseslint = require('typescript-eslint');
const eslint = require('@eslint/js');

module.exports = tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      'eqeqeq': 'error',
      'max-len': ['error', {code: 120}],
      'indent': ['error', 2],
      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': 'error',
      'id-length': ['error', {min: 2, exceptions: ['i', 'j', 'k', '_']}],
      'max-nested-callbacks': ['error', {max: 3}],
    },
  },
);
