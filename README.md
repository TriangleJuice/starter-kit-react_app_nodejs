# Digipolis UI starter kit

This starter kit makes it easy for you to create a frontend [ACPaaS UI](https://acpaas-ui.digipolis.be) and/or backend nodejs app.

## Basic usage

```sh
> npm install -g @digipolis/start-ui
> cd your-app
> digipolis-start-ui
```

## Advanced

### Run the starter kit without questionnaire

```sh
> digipolis-start-ui --no-setup
```

Run the help command in order to see all available configuration options:

```sh
> digipolis-start-ui --help
```

#### Params

  * `-V, --version`              output the version number
  * `-d, --debug`                debug
  * `-S, --no-setup`             Skip setup questions
  * `-f, --frontend <frontend>`  Frontend (angular or react) (default: "react")
  * `-b, --backend <backend>`    Backend framework (Node.js or none) (default: "nodejs")
  * `-n, --name <name>`          The name for your app (default: "Starter app")
  * `-b, --branding <branding>`  Branding (Antwerp, Digipolis or ACPaaS) (default: "Antwerp")
  * `-F, --no-flexboxgrid`       Don't use the Flexbox grid
  * `-R, --no-routing`           Don't add basic routing
  * `-d, --database <database>`  Database (MongoDB or none) (default: "mongodb")
  * `-A, --no-auth`              Don't add basic authentication
  * `-h, --help`                 output usage information


## Working with the starterkit

### config

This folder contains basic configuration for back-end, front-end, branding, questions and general options.

### utils

Small utils to help the generators.

### generators

#### angular

Angular-cli based generator to generate a basic app with the option to add routing and/or authentication.

#### DotNet

Not yet implemented.

#### nodejs

A nodejs backend app wiht several options for routing/authenticatin, etc...

#### React

Create-react-app based generator to generate a basic app with the option to add routing and/or authentication.
