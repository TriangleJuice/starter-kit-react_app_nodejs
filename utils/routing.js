const routingReplaceOptions = [
  {
    files: './frontend/src/index.js',
    from: `import ReactDOM from 'react-dom';`,
    to: `import ReactDOM from 'react-dom';
import { BrowserRouter } from "react-router-dom";`,
  },
  {
    files: './frontend/src/index.js',
    from: `<App />`,
    to: `<BrowserRouter><App /></BrowserRouter>`,
  },
  {
    files: './frontend/src/App.js',
    from: `import Home from './components/Home/Home';`,
    to: `import Home from './components/Home/Home';
import About from './components/About/About';`,
  },
  {
    files: './frontend/src/App.js',
    from: `import React, { Component } from 'react';`,
    to: `import React, { Component } from 'react';
import { Link, Route, Switch } from "react-router-dom";`,
  },
  {
    files: './frontend/src/App.js',
    from: `<Header />`,
    to: `<Header>
            <div className="m-button-group">
              <Link to={'/'} className="a-button">Home</Link>
              <Link to={'/about'} className="a-button">About</Link>
            </div>
          </Header>`,
  },
  {
    files: './frontend/src/App.js',
    from: `<Home />`,
    to: `<Switch>
                  <Route path="/about" component={About}></Route>
                  <Route path="/" component={Home} />
                </Switch>`,
  },
];

mapRouting = (val) => {
  if (val) {
		return {
			add: true,
			npm: ['react-router-dom'],
		};
	} else {
		return {
			add: false,
			npm: [],
		};
	}
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = {
  routingReplaceOptions,
  mapRouting,
  asyncForEach,
};
