/**@type {import('eslint').Linter.Config} */

// eslint-disable-next-line no-undef
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jsonc/base',
		'plugin:jsonc/recommended-with-json'
	],
	rules: {
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/explicit-module-boundary-types': 0,
		'@typescript-eslint/no-non-null-assertion': 0,
		'@typescript-eslint/semi': ['warn', 'always'],
		'@typescript-eslint/quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
	},
	overrides: [
		{
			files: ['*.json', '*.json5', '*.jsonc'],
			parser: 'jsonc-eslint-parser',
		}
	],
};