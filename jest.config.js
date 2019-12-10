module.exports = {
  moduleFileExtensions: ['js'],
  verbose: true,
  testPathIgnorePatterns: [
    '/generators/react/files',
    '/node_modules',
  ],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
};
