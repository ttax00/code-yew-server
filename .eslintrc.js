/**@type {import('eslint').Linter.Config} */

// eslint-disable-next-line no-undef
module.exports = {
	root: true,
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:jsonc/base',
		'plugin:jsonc/recommended-with-json'
	],
	overrides: [
		{
			files: ['*.json', '*.json5', '*.jsonc'],
			excludedFiles: ['package-lock.json', 'package.json'],
			parser: 'jsonc-eslint-parser',
			rules: {
				'jsonc/array-bracket-newline': ['warn',
					{
						'multiline': true,
						'minItems': 10
					}
				]
			}
		},
		{
			files: ['*.ts', '*.js'],
			parser: '@typescript-eslint/parser',
			rules: {
				'@typescript-eslint/no-unused-vars': 0,
				'@typescript-eslint/no-explicit-any': 0,
				'@typescript-eslint/explicit-module-boundary-types': 0,
				'@typescript-eslint/no-non-null-assertion': 0,
				'@typescript-eslint/semi': ['warn', 'always'],
				'@typescript-eslint/quotes': ['warn', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': true }],
				'@typescript-eslint/indent': [
					'warn',
					'tab',
					{
						'SwitchCase': 1,
						'ignoredNodes': [
							'ConditionalExpression',
							'PropertyDefinition[decorators]',
							'TSUnionType'
						]
					}
				],
			}
		}
	],
};