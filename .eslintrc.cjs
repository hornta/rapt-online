/* eslint-env node*/

module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react/jsx-runtime",
		"plugin:@typescript-eslint/recommended",
		"prettier",
	],
	overrides: [],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	plugins: ["react", "@typescript-eslint"],
	rules: {
		"lines-between-class-members": [
			"error",
			"always",
			{ exceptAfterSingleLine: true },
		],
		curly: ["error"],
		eqeqeq: ["error"],
		"prefer-arrow-callback": ["error"],
		"one-var-declaration-per-line": ["error", "always"],
		"one-var": ["error", "never"],
		"@typescript-eslint/no-non-null-assertion": "off",
		"@typescript-eslint/no-empty-function": "off",
	},
};
