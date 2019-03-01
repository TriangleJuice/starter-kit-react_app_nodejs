
/**
 * Define general questionnaire questions
 * Framework spesific question are defined on the generator level
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
  {
    type: 'list',
    name: 'frontend',
    message: 'Which frontend framework would you like?',
    choices: [
      { value: 'angular', name: 'Angular' },
      { value: 'react', name: 'React' },
    ],
  },
];

module.exports = questions;
