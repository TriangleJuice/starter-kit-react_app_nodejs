/**
 * Only for testing purposes, don't use this file for production code!
 */
import * as mockFs from 'mock-fs';
export function setUpMockDir() {
  global.__basedir = '.';
  global.__frontenddir = './frontend';
  mockFs.default({
    generators: {
      angular: {
        files: {
          extra: {
            src: {
              app: {
                pages: {
                  login: {

                  },
                  home: {

                  },
                  about: {

                  }
                },
                services: {

                },
                'app-routing.module.ts.template.hbs': ''
              }
            }
          },
          src: {
            app: {

            },
            'index.html.template.hbs': '',
            'styles.scss.template.hbs': ''
          }
        }
      }
    }
  });
}
