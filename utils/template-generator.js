import * as handlebars from 'hbs';
import { readFile } from 'fs';
import * as path from 'path';
import * as frontEndConfig from '../config/front-end.config';
import overwriteAndRename from './overwrite';

const compileHbsTemplate = async (hbs, filePath, model) => {
  const readTemplate = new Promise((resolve, reject) => readFile(filePath, (err, data) => (err ? reject(err) : resolve(data.toString()))));
  return hbs.compile(await readTemplate)(model);
};

export default class HandlebarsTemplateGenerator {
  constructor(rawConfiguration) {
    this.hbs = handlebars.create();
    this.hbs.registerHelper('ifEquals', (arg1, arg2, options) => {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });
    this.configuration = rawConfiguration;
  }

  static prepConfigForRendering(configuration) {
    return {
      ...configuration,
      coreBranding: (configuration.branding && configuration.branding.type === 'core'),
      frontEndConfig,
      scss: configuration.branding.scss && configuration.branding.scss.length > 0 ? configuration.branding.scss.join('/n') : undefined,
    }
  }

  async compileAndRenderTemplate(templatePath, configuration) {
    const preppedConfig = HandlebarsTemplateGenerator.prepConfigForRendering(configuration);
    const readTemplate = new Promise((resolve, reject) => readFile(templatePath, (err, data) => (err ? reject(err) : resolve(data.toString()))));
    return this.hbs.handlebars.compile(await readTemplate)(preppedConfig);
  }

  async generate(options) {
    const code = await this.compileAndRenderTemplate(options.fromTemplate, this.configuration);
    return await overwriteAndRename(
      options.fromTemplate,
      options.to,
      code
    );
  }
}
