import * as handlebars from 'hbs';
import { readFile } from 'fs';
import * as path from 'path';
import * as frontEndConfig from '../../config/front-end.config';

const compileHbsTemplate = async (hbs, filePath, model) => {
  const readTemplate = new Promise((resolve, reject) => readFile(filePath, (err, data) => (err ? reject(err) : resolve(data.toString()))));
  return hbs.compile(await readTemplate)(model);
};

export default class AngularTemplateGenerator {
  constructor() {
    this.hbs = handlebars.create();
    this.hbs.registerHelper('ifEquals', (arg1, arg2, options) => {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });
  }

  async generateIndexFile(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/index.html.template.hbs'), {
      ...configuration,
      coreBranding: (configuration.branding && configuration.branding.type === 'core'),
      frontEndConfig,
    });
    return code;
  }

  async generateAppModule(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/src/app/app.module.ts.template.hbs'), configuration);
    return code;
  }

  async generateAppComponentTemplate(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/src/app/app.component.html.template.hbs'), configuration);
    return code;
  }

  async generateStyles(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/styles.scss.template.hbs'), {
      ...configuration,
      coreBranding: (configuration.branding && configuration.branding.type === 'core'),
      branding: {
        ...configuration.branding,
        scss: configuration.branding.scss && configuration.branding.scss.length > 0 ? configuration.branding.scss.join('/n') : undefined,
      },
    });
    return code;
  }

  async generatePagesIndex(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/extra/src/app/pages/index.ts.template.hbs'), configuration);
    return code;
  }

  async generateRoutingModule(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/extra/src/app/app-routing.module.ts.template.hbs'), configuration);
    return code;
  }

  async generateAppComponentTs(configuration = {}) {
    const code = await compileHbsTemplate(this.hbs.handlebars, path.resolve(__dirname, 'files/src/app/app.component.ts.template.hbs'), configuration);
    return code;
  }
}
