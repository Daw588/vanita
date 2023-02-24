/*
	Make sure to allow eslint to validate .svelte files!

	In settings.json:

	"eslint.validate": [
		"svelte"
	]
*/

module.exports = {
	root: true,
	overrides: [
		// TypeScript inside Svelte
		{
			processor: "svelte3/svelte3",
			parser: "@typescript-eslint/parser",
			plugins: [
				"svelte3",
				"@typescript-eslint"
			],
			files: ["*.svelte"],
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
				project: ["./tsconfig.json"],
				extraFileExtensions: [".svelte"]
			}
		},

		// TypeScript
		{
			parser: "@typescript-eslint/parser",
			plugins: [
				"@typescript-eslint"
			],
			env: {
				browser: true,
				node: true,
			},
			files: ["*.ts"]
		},

		// TypeScript and TypeScript inside Svelte
		{
			files: ["*.ts", "*.svelte"],
			parserOptions: {
				project: ["./tsconfig.json"],
			},
			rules: {
				"@typescript-eslint/naming-convention": [
					"error",
					{
						selector: ["default"],
						format: ["camelCase"],
						leadingUnderscore: "forbid",
						trailingUnderscore: "forbid"
					},
					{
						selector: ["default"],
						modifiers: ["const", "global"],
						types: ["boolean", "string", "number", "array"],
						format: ["UPPER_CASE"],
						leadingUnderscore: "forbid",
						trailingUnderscore: "forbid"
					},
					{
						selector: ["objectLiteralProperty"],
						format: null,
						leadingUnderscore: "forbid",
						trailingUnderscore: "forbid"
					},
					{
						selector: ["typeLike"],
						format: ["PascalCase"],
						leadingUnderscore: "forbid",
						trailingUnderscore: "forbid"
					},
				],
				"@typescript-eslint/no-mixed-enums": "error",
				"@typescript-eslint/no-namespace": "error",
				"@typescript-eslint/ban-types": "error",
				"@typescript-eslint/no-extra-semi": "error",
				"@typescript-eslint/no-require-imports": "error",
				"@typescript-eslint/no-useless-empty-export": "error",

				// Formatting
				"@typescript-eslint/brace-style": [
					"error",
					"1tbs",
					{
						"allowSingleLine": true
					}
				],
				"@typescript-eslint/quotes": [
					"error",
					"double",
					{
						"avoidEscape": false,
						"allowTemplateLiterals": false
					}
				],
				"@typescript-eslint/semi": [
					"error",
					"always"
				],
				"@typescript-eslint/keyword-spacing": [
					"error",
					{
						before: true,
						after: true
					}
				],
				"@typescript-eslint/key-spacing": ["error"],
				"@typescript-eslint/lines-between-class-members": [
					"error",
					"always"
				],
				"@typescript-eslint/type-annotation-spacing": [
					"error",
					{
						before: false,
						after: true,
						overrides: {
							arrow: {
								before: true,
								after: true
							}
						}
					}
				],
				"@typescript-eslint/no-extra-parens": [
					"error",
					"functions"
				]
			}
		},

		// JavaScript
		{
			files: ["*.js", "*.cjs"],
			parserOptions: {
				sourceType: "module"
			},
			env: {
				es2022: true
			}
		}
	],
	settings: {
		"svelte3/typescript": () => import("typescript"), // pass the TypeScript package to the Svelte plugin
		"svelte3/typescript": true // load TypeScript as peer dependency
	},
	ignorePatterns: ["node_modules"]
};