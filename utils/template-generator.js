import * as handlebars from 'hbs';
import { readFile } from 'fs';
import * as path from 'path';
import * as frontEndConfig from '../config/front-end.config';
import overwriteAndRename from './overwrite';

/**
 * Class used to compile and render handlebars template files.
 * This class is framework independent, so can be used in several generate processes
 * like Angular, React, ...
 */
export default class HandlebarsTemplateGenerator {

  /**
   * @param Configuration Configuration object. This object will get some extra properties in
   * order to enable Handlebars templating.
   */
  constructor(rawConfiguration) {
    this.hbs = handlebars.create();
    this.hbs.registerHelper('ifEquals', (arg1, arg2, options) => {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    });
    this.configuration = rawConfiguration;
  }

  /**
   * Extend the configuration with some extra properties that are relevant for templating
   * The configuration object returned shouldn't be used for other purposes than templating.
   * @param Configuration configuration
   */
  static prepConfigForRendering(configuration) {
    return {
      ...configuration,
      coreBranding: (configuration.branding && configuration.branding.type === 'core'),
      frontEndConfig,
      scss: configuration.branding.scss && configuration.branding.scss.length > 0 ? configuration.branding.scss.join('/n') : undefined,
    }
  }

  /**
   * Compiles a template , given a template path and a configuration object that will act as template model.
   * This method returns the rendered template as string.
   * @returns string
   */
  async compileAndRenderTemplate(templatePath, configuration) {
    const preppedConfig = HandlebarsTemplateGenerator.prepConfigForRendering(configuration);
    const readTemplate = new Promise((resolve, reject) => readFile(templatePath, (err, data) => (err ? reject(err) : resolve(data.toString()))));
    return this.hbs.handlebars.compile(await readTemplate)(preppedConfig);
  }

  /**
   * Generates a file based on the template.
   * The template will get compiled, rendered and renamed to be usable in an actual application context.
   */
  async generate(options) {
    const code = await this.compileAndRenderTemplate(options.fromTemplate, this.configuration);
    return await overwriteAndRename(
      options.fromTemplate,
      options.to,
      code
    );
  }
}
