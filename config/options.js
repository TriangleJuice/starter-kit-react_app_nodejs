const requireDir = require('require-dir');
const program = require('commander');

const pjson = require('../package.json');

const generators = requireDir('../generators');
const generatorNames = Object.keys(generators);

const generalOptions = [
  {
    param: '-d, --debug ',
    description: 'debug',
  },
  {
    param: '-S, --no-setup',
    description: 'Skip setup questions',
  },
  // {
  //   param: '-f, --frontend <frontend>',
  //   description: 'Frontend framework (React or Angular)',
  //   validation: /^(react|angular)$/i,
  //   fallback: 'react',
  // },
  {
    param: '-b, --backend <backend>',
    description: 'Backend framework (Node.js or none)',
    validation: /^(nodejs|dotnet)$/i,
    fallback: 'nodejs',
  },
];

function getUnique(arr, comp) {
  const unique = arr
    .map(e => e[comp])
    // store the keys of the unique objects
    .map((e, i, final) => final.indexOf(e) === i && i)
    // eliminate the dead keys & store unique objects
    .filter(e => arr[e]).map(e => arr[e]);
  return unique;
}

function commander() {
  let options = [...generalOptions];
  generatorNames.forEach((name) => {
    if (generators[name].getOptions) {
      const moduleOptions = generators[name].getOptions();
      options = [...options, ...moduleOptions];
    }
  });
  options = getUnique(options, 'param');
  let prog = program.version(pjson.version).usage('[options]');
  options.forEach(({ param, description, validation, fallback }) => {
    const params = [param, description];
    if (validation) params.push(validation);
    if (fallback) params.push(fallback);
    prog = prog.option(...params);
  });
  return prog.parse(process.argv);
}

module.exports = commander;
