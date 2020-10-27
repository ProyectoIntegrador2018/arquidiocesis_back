# Nombre del proyecto

APP de Arquidiocesis de Monterrey

## Table of contents

- [Client Details](#client-details)
- [Environment URLS](#environment-urls)
- [Team](#team)
- [Technology Stack](#technology-stack)
- [Management Tools](#management-tools)
- [Setup the project](#setup-the-project)
- [Running the stack for development](#running-the-stack-for-development)

### Client Details

| Name         | Email                   | Role |
| ------------ | ----------------------- | ---- |
| Hector Ayala | ayalahector@hotmail.com | CEO  |

### Environment URLS

- **Production** - https://arquidiocesis-bda.herokuapp.com
- **Development** - N/A

### Team

| Name            | Email              | Role                               |
| --------------- | ------------------ | ---------------------------------- |
| Roberto Treviño | A01282035@itesm.mx | SCRUM Master/ Líder                |
| Diego Martínez  | A01176489@itesm.mx | Product Owner Proxy                |
| Fernando López  | A01172527@itesm.mx | Administración de la configuración |
| Carlos Tamez    | A00817514@itesm.mx | Administrador del Proyecto         |
| Andrés Sánchez  | A00819118@itesm.mx | Development                        |
| Carlos Miranda  | A00817390@itesm.mx | Development                        |
| Gerardo Suarez  | A00817505@itesm.mx | Development                        |
| Rolando Mata    | A00816442@itesm.mx | Development                        |

### Technology Stack

| Technology | Version  |
| ---------- | -------- |
| NodeJS     | 12.16.01 |
| ExpressJS  | 04.17.01 |
| Firebase   | 08.10.00 |

### Management tools

You should ask for access to this tools if you don't have it already:

- [Github repo](https://github.com/ProyectoIntegrador2018/arquidiocesis-back)
- [Backlog](https://trello.com)
- [Heroku](https://arquidiocesis-bda.herokuapp.com/)
- Documentation (Microsoft Teams)

## Development

### Setup the project

Make sure the following tools are installed in your system:

- [Node v12.X.X](https://nodejs.org/en/download/)
- [Yarn v1.21.X](https://yarnpkg.com/en/docs/install)
- [Git v2.X.X](https://git-scm.com/downloads)

1. Clone this repository into your local machine

```bash
$ git clone git@github.com:ProyectoIntegrador2018/arquidiocesis-back.git
$ cd arquidiocesis-back
```

2. Install the project dependencies

```bash
$ yarn install
```

### Running the stack for Development

#### MacOS

1. Open a terminal and run:

```bash
$ export NODE_ENV=development
```

2. Add the file `ServiceAccountKey.json` which contains the Firebase credentials (ask to an admin)

3. Then run the project using

```bash
$ yarn run start:dev
```

That command will open the server on port 8000 by default.

### Stop the project

To stop the application run control + C or command + C (mac) in the terminal.

### Set your own port number

#### MacOS

1. Open the terminal and run:

```bash
$ export PORT=<your port number here>
```

### Running the stack for Production

#### MacOS

1. Open terminal and run:

```bash
$ export NODE_ENV=production
```

2. Then run the project:

```bash
$ yarn run start
```

## Documentation

All code is documented using [jsdocs](https://jsdoc.app/) and should come included with the project, if not, read up the section below to [generate documentation](#generating-documentation).

Navigate to **_docs_** folder and open _index.html_. This will open our documentaiton webpage.

### Generating Documentation

> We recommend VSCode for a better coding experience and giving the following plugins a try: [HTML CSS Support Plugin](https://github.com/ecmel/vscode-html-css) by _ecmel_ and [HTML Preview](https://github.com/tht13/html-preview-vscode) by _Thomas Haakon Townsend_

To further develop, [run the stack in development](#Running-the-stack-for-Development) and run the command to generate the documentation:

```
yarn run docs
```

A new **_docs_** folder should have been created.

VSCode mac users run:

```
cmd-shift-v
```

VSCode windows users run:

```
ctrl-shift-v
```

this will open a new preview window, you can drag the pane to the side to preview changes as you develop the code.

## Version control

### Conventional commits

Commit messages are an essential part of software development because they allow us to communicate why our code changed.

To enforce a good convention is followed we're using [Commitizen](https://github.com/commitizen/cz-cli) and [Commitlint](https://github.com/conventional-changelog/commitlint).

Commitizen is a command line utility that will prompt you to fill in any required fields (run with `yarn commit`) and your commit messages will be formatted according to the standards defined by project maintainers. In our case, we're using the [conventional changelog](https://github.com/conventional-changelog/conventional-changelog) standard with the following structure:

```
type(scope): subject
```

Commitlint is a linter for our commit messages and checks if they meet the [conventional commit format](https://www.conventionalcommits.org).

Commitizen and commitlint will enforce we're creating conventional commit messages and, with the help of [husky](https://github.com/typicode/husky), they will prevent us from committing changes without the proper message structure.

### Semantic release

One of the advantages of using the conventional commit format is that dovetails with [SemVer](https://semver.org), by describing the features, fixes, and breaking changes made in commit messages.

[Semantic release](https://github.com/semantic-release/semantic-release) uses the commit messages to determine the type of changes in the codebase and automatically determines the next semantic version number, updates our version property in `package.json`, generates a changelog, commits the change and publishes the release to GitHub (both the commit and the release tag).

### GitHub templates and workflows

To ensure a standard when creating Pull Requests or Issues (bug or feature request) we've included some templates inside the `.github` folder.

To automate the release of new versions we're using GitHub Actions to run the following workflows:

- **Verify pull request base branch:** Run when a pull request to the `master` branch is open. It will verify the base branch is `dev` and will fail if not the case.
- **Set release version:** Run when changes are pushed to `master`. It will run `semantic-release` and sync the `master` branch with `dev`. To enable this workflow in your repository add the `GH_TOKEN` secret based on a personal access token with repo scope.

To disable a given workflow simply remove the file.
