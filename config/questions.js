const { mapBranding, brandings } = require('../utils/branding');
/**
 * Define questionnaire questions
 */
const questions = [
  {
    type: 'list',
    name: 'backend',
    message: 'Which bff would you like',
    choices: [
      { value: 'nodejs', name: 'Node.js' },
      { value: 'dotnet', name: '.net' },
      { value: undefined, name: 'I don`t need a backend' },
    ],
  },
  {
    type: 'list',
    name: 'frontend',
    message: 'Which framework would you like',
    choices: [
      { value: 'angular', name: 'Angular' },
      { value: 'react', name: 'React' },
    ],
  },
  {
    type: 'list',
    name: 'branding',
    message: 'Which branding do you want to use?',
    choices: Object.keys(brandings),
  },
  {
    type: 'confirm',
    name: 'flexboxgrid',
    message: 'Do you want to use the Flexbox grid?',
    default: true,
  },
];

module.exports = questions;
