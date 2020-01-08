const allRouteReplaceOptions = [
  {
    files: `${__frontenddir}/src/index.js`,
    from: "import ReactDOM from 'react-dom';",
    to: `import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";`,
  },
  {
    files: `${__frontenddir}/src/index.js`,
    from: '<App />',
    to: '<BrowserRouter><App /></BrowserRouter>',
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: "import Home from './components/Home/Home';",
    to: `import Home from './components/Home/Home';
import About from './components/About/About';`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: "import React, { Component } from 'react';",
    to: `import React, { Component } from 'react';
import { Link, Route, Switch } from "react-router-dom";`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: '<Header logoAlt="{{BRANDING_NAME}} logo." logoSrc="https://cdn.antwerpen.be/{{BRANDING_TYPE}}_branding_scss/{{BRANDING_VERSION}}/assets/images/{{BRANDING_LOGO}}" />',
    to: `<Header logoAlt="{{BRANDING_NAME}} logo." logoSrc="https://cdn.antwerpen.be/{{BRANDING_TYPE}}_branding_scss/{{BRANDING_VERSION}}/assets/images/{{BRANDING_LOGO}}">
            <div className="o-header__content-wrapper">
              <div className="o-header__menu-items">
                <div className="o-header__menu-item">
                  <Link to={'/'} className="a-button-negative o-header__button">Home</Link>
                </div>
                <div className="o-header__menu-item">
                  <Link to={'/about'} className="a-button-negative o-header__button">About</Link>
                </div>
              </div>
            </div>
          </Header>`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: '<Home />',
    to: `<Switch>
                  <Route path="/about" component={About}></Route>
                  <Route path="/" component={Home} />
                </Switch>`,
  },
];

const loginReplaceOptions = [
  {
    files: `${__frontenddir}/src/App.js`,
    from: 'Footer,',
    to: `Footer,
  UserMenu,`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: 'class App extends Component {',
    to: `class App extends Component {
  state = {
    isLoggedin: false,
    user: undefined,
  }

  componentDidMount() {
    fetch('/auth/isloggedin')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error('Request rejected with status ' + response.status);
        }
      })
      .then(data => this.setState({ isLoggedin: data.isLoggedin, user: data.user }))
      .catch(console.error);
  }
`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: '<Header logoAlt="{{BRANDING_NAME}} logo." logoSrc="https://cdn.antwerpen.be/{{BRANDING_TYPE}}_branding_scss/{{BRANDING_VERSION}}/assets/images/{{BRANDING_LOGO}}" />',
    to: `<Header logoAlt="{{BRANDING_NAME}} logo." logoSrc="https://cdn.antwerpen.be/{{BRANDING_TYPE}}_branding_scss/{{BRANDING_VERSION}}/assets/images/{{BRANDING_LOGO}}">
          <div className="o-header__content-wrapper">
            <div className="o-header__menu-items">
              <div className="o-header__menu-item">
                <UserMenu
                  user={this.state.user}
                  loggedIn={this.state.isLoggedin}
                  loginUrl="/auth/login/mprofiel"
                  logoutUrl="/auth/logout/callback/mprofiel">
                </UserMenu>
              </div>
            </div>
          </div>
          </Header>`,
  },
];

const loginRoutingReplaceOptions = [
  {
    files: `${__frontenddir}/src/App.js`,
    from: 'Link, Route, Switch',
    to: 'Link, Route, Switch, withRouter',
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: 'Footer,',
    to: `Footer,
  UserMenu,`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: "import About from './components/About/About';",
    to: `import About from './components/About/About';
import Login from './components/Login/Login';`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: 'class App extends Component {',
    to: `class App extends Component {
  state = {
    isLoggedin: false,
    user: undefined,
  }

  componentDidMount() {
    fetch('/auth/isloggedin')
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error('Request rejected with status ' + response.status);
        }
      })
      .then(data => this.setState({ isLoggedin: data.isLoggedin, user: data.user }))
      .catch(console.error);
  }
`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: `<div className="o-header__menu-item">
                  <Link to={'/about'} className="a-button-negative o-header__button">About</Link>
                </div>`,
    to: `<div className="o-header__menu-item">
                  <Link to={'/about'} className="a-button-negative o-header__button">About</Link>
                </div>
                <div className="o-header__menu-item">
                  <UserMenu
                    user={this.state.user}
                    loggedIn={this.state.isLoggedin}
                    loginUrl="/login"
                    logoutUrl="/auth/logout/callback/mprofiel">
                  </UserMenu>
                </div>`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: '<Route path="/about" component={About}></Route>',
    to: `<Route path="/about" component={About}></Route>
                  <Route path="/login" component={Login}></Route>`,
  },
  {
    files: `${__frontenddir}/src/App.js`,
    from: 'export default App;',
    to: 'export default withRouter(App);',
  },
];

const mapRouting = (conf) => {
  if (!conf.routing) {
    return {
      add: false,
      npm: [],
    };
  }
  return {
    add: true,
    npm: ['react-router-dom'],
  };
};

function mapReplacements(replacements) {
  return replacements.reduce((acc, value) => {
    if (!acc[value.files]) {
      acc[value.files] = {
        files: value.files,
        from: [],
        to: [],
      };
    }

    acc[value.files].from.push(value.from);
    acc[value.files].to.push(value.to);

    return acc;
  }, {});
}

function getRoutingReplaceOptions() {
  return mapReplacements(allRouteReplaceOptions);
}

function getLoginReplaceOptions() {
  return mapReplacements(loginReplaceOptions);
}

function getLoginRoutingReplaceOptions() {
  return mapReplacements(loginRoutingReplaceOptions);
}

module.exports = {
  getRoutingReplaceOptions,
  getLoginReplaceOptions,
  getLoginRoutingReplaceOptions,
  mapRouting,
};
