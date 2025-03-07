module.exports = {
  // The root directory where Jest should look for tests
  rootDir: '.',
  
  // The environment that Jest will use
  testEnvironment: 'jsdom',
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Don't transform node_modules except for specific modules
  transformIgnorePatterns: [
    '/node_modules/(?!axios).+\\.js$'
  ],
  
  // Mock CSS and image imports
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  
  // Setup files to run before each test
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Collect coverage information
  collectCoverage: true,
  
  // Specify directories for coverage
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/reportWebVitals.js',
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
};