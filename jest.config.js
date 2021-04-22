module.exports = {
	transform: {
		"^.+\\.svelte$": "jest-transform-svelte",
		"^.+\\.js$": "babel-jest",
	},
	moduleFileExtensions: ["js", "svelte"],
	testPathIgnorePatterns: ["node_modules"],
	bail: false,
	verbose: true,
	collectCoverage: true,
	// collectCoverageFrom: ["src/components/**", "src/utils/**", "src/models/**"],
	transformIgnorePatterns: ["node_modules"],
	coverageReporters: ["lcov", "text"],
	setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/src/$1",
	},
};
