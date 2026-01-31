module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      // Enable this if you have ESM issues with specific libraries
      // useESM: true,
    }],
  },
  // Setup files if needed
  // setupFilesAfterEnv: ['<rootDir>/src/db/__tests__/setup.ts'],
  
  // Handle ESM modules that need to be transformed
  transformIgnorePatterns: [
    'node_modules/(?!(@nozbe/watermelondb|@nozbe/watermelondb/decorators|ts-fsrs)/)',
  ],
};
