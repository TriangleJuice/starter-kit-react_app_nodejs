const routingReplaceOptions = [
  {
    files: './frontend/src/index.js',
    from: "import ReactDOM from 'react-dom';",
    to: `import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";`,
  },
  {
    files: './frontend/src/index.js',
    from: '<App />',
    to: '<BrowserRouter><App /></BrowserRouter>',
  },
  {
    files: './frontend/src/App.js',
    from: "import Home from './components/Home/Home';",
    to: `import Home from './components/Home/Home';
import About from './components/About/About';`,
  },
  {
    files: './frontend/src/App.js',
    from: "import React, { Component } from 'react';",
    to: `import React, { Component } from 'react';
import { Link, Route, Switch } from "react-router-dom";`,
  },
  {
    files: './frontend/src/App.js',
    from: '<Header />',
    to: `<Header>
            <div className="m-button-group">
              <Link to={'/'} className="a-button">Home</Link>
              <Link to={'/about'} className="a-button">About</Link>
            </div>
          </Header>`,
  },
  {
    files: './frontend/src/App.js',
    from: '<Home />',
    to: `<Switch>
                  <Route path="/about" component={About}></Route>
                  <Route path="/" component={Home} />
                </Switch>`,
  },
];

const loginReplaceOptions = [
  {
    files: './frontend/src/App.js',
    from: 'Footer,',
    to: `Footer,
  UserMenu,`,
  },
  {
    files: './frontend/src/App.js',
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
    files: './frontend/src/App.js',
    from: '<Header />',
    to: `<Header>
            <div className="m-button-group">
              <UserMenu
                user={this.state.user}
                loggedIn={this.state.isLoggedin}
                loginUrl="/auth/login/mprofiel"
                logoutUrl="/auth/logout/callback/mprofiel">
              </UserMenu>
            </div>
          </Header>`,
  },
];

const loginRoutingReplaceOptions = [
  {
    files: './frontend/src/App.js',
    from: 'Link, Route, Switch',
    to: 'Link, Route, Switch, withRouter',
  },
  {
    files: './frontend/src/App.js',
    from: 'Footer,',
    to: `Footer,
  UserMenu,`,
  },
  {
    files: './frontend/src/App.js',
    from: "import About from './components/About/About';",
    to: `import About from './components/About/About';
import Login from './components/Login/Login';`,
  },
  {
    files: './frontend/src/App.js',
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
    files: './frontend/src/App.js',
    from: '<Link to={\'/about\'} className="a-button">About</Link>',
    to: `<Link to={'/about'} className="a-button">About</Link>
              <UserMenu
                user={this.state.user}
                loggedIn={this.state.isLoggedin}
                loginUrl="/login"
                logoutUrl="/auth/logout/callback/mprofiel">
              </UserMenu>`,
  },
  {
    files: './frontend/src/App.js',
    from: '<Route path="/about" component={About}></Route>',
    to: `<Route path="/about" component={About}></Route>
                  <Route path="/login" component={Login}></Route>`,
  },
  {
    files: './frontend/src/App.js',
    from: 'export default App;',
    to: 'export default withRouter(App);',
  },
];

mapRouting = (conf) => {
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

module.exports = {
  routingReplaceOptions,
  loginReplaceOptions,
  loginRoutingReplaceOptions,
  mapRouting,
};
