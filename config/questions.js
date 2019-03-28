
/**
 * Define general questionnaire questions
 * Framework specific questions are defined on the generator level
 */
const questions = [
  {
    type: 'list',
    name: 'backend',
    message: 'Which BFF technology would you like?',
    choices: [
      { value: 'nodejs', name: 'Node.js' },
      { value: undefined, name: 'I don\'t need a BFF' },
    ],
  },
];

module.exports = questions;
