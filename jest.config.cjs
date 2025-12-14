module.exports = {
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        useESM: true
      }
    ]
  },
  moduleNameMapper: { '\\.(css|less|scss|sass)$': 'identity-obj-proxy' },
  setupFilesAfterEnv: ['@testing-library/jest-dom']
};
