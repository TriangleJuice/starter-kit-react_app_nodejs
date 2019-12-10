module.exports = {
  moduleFileExtensions: ['js'],
  verbose: true,
  testPathIgnorePatterns: [
    '/generators',
    '/node_modules',
  ],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
};
