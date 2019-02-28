const { mapBranding, brandings } = require('../utils/branding');

/**
 * Define questionnaire questions
 */
const questions = [
  // {
  //   type: 'list',
  //   name: 'backend',
  //   message: 'Which BFF technology would you like?',
  //   choices: [
  //     { value: 'nodejs', name: 'Node.js' },
  //     { value: 'dotnet', name: '.NET Core' },
  //     { value: undefined, name: 'I don\'t need a BFF' },
  //   ],
  // },
  // {
  //   type: 'list',
  //   name: 'frontend',
  //   message: 'Which frontend framework would you like?',
  //   choices: [
  //     { value: 'angular', name: 'Angular' },
  //     { value: 'react', name: 'React' },
  //   ],
  // },
  {
    type: 'list',
    name: 'branding',
    message: 'Which branding do you want to use?',
    choices: Object.keys(brandings),
    filter: mapBranding,
  },
  {
    type: 'confirm',
    name: 'flexboxgrid',
    message: 'Do you want to use the Flexbox grid?',
    default: true,
  },
  {
    type: 'confirm',
    name: 'routing',
    message: 'Do you want to add basic routing?',
    default: true,
  },
];

module.exports = questions;
