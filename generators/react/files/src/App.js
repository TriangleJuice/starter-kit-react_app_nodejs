import React, { Component } from 'react';
import {
  Header,
  Footer,
} from '@acpaas-ui/react-components';
/**
 * More ACPaaS UI documentation can be found here:
 * https://digipolisantwerp.github.io/acpaas-ui_react/
 */
import './App.scss';
import Home from './components/Home/Home';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <Header logoAlt="{{BRANDING_NAME}} logo." logoSrc="https://cdn.antwerpen.be/{{BRANDING_TYPE}}_branding_scss/{{BRANDING_VERSION}}/assets/images/{{BRANDING_LOGO}}" />
        </header>
        <div className="main u-wrapper">
          <div className="u-container u-margin-top-xx u-margin-bottom-lg" role="main">
            <div className="row">
              <div className="col-xs-12">
                <h1 className="u-margin-top-xl">Hello Starter app!</h1>
                <Home />
              </div>
            </div>
          </div>
        </div>
        <footer>
          <Footer />
        </footer>
      </div>
    );
  }
}

export default App;
