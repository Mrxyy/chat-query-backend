module.exports = {
  testEnvironment: 'node',
  testRegex: '.test.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testPathIgnorePatterns: [],
  moduleNameMapper: {
    '^antlr4$': '<rootDir>/node_modules/dbml-core/node_modules/antlr4',
  },
};
