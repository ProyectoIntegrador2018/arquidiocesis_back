# Nombre del proyecto

APP de Arquidiocesis de Monterrey

## Table of contents

* [Client Details](#client-details)
* [Environment URLS](#environment-urls)
* [Team](#team)
* [Technology Stack](#technology-stack)
* [Management Tools](#management-tools)
* [Setup the project](#setup-the-project)
* [Running the stack for development](#running-the-stack-for-development)


### Client Details

| Name               | Email             | Role |
| ------------------ | ----------------- | ---- |
| Hector Ayala       | ayalahector@hotmail.com | CEO  |


### Environment URLS

* **Production** - [TBD](TBD)
* **Development** - [TBD](TBD)

### Team

| Name           | Email              | Role        |
| -------------- | ------------------ | ----------- |
| Andrés Sánchez | A00819118@itesm.mx | Development |
| Carlos Miranda | A00817390@itesm.mx | Development |
| Gerardo Suarez | A00817505@itesm.mx | Development |
| Rolando Mata   | A00816442@itesm.mx | Development |

### Technology Stack
| Technology    | Version      |
| ------------- | -------------|
| NodeJS        | 12.16.01     |
| ExpressJS     | 04.17.01     |

### Management tools

You should ask for access to this tools if you don't have it already:

* [Github repo](https://github.com/ProyectoIntegrador2018/arquidiocesis-back)
* Backlog (Microsoft Teams)
* [Heroku](https://arquidiocesis.herokuapp.com/)
* Documentation (Microsoft Teams)

## Development

### Setup the project
1. Download [Node](https://nodejs.org). Node comes with the latest [npm](npmjs.com). 

2. Clone the repository using ssh: 
```bash
$ git clone git@github.com:ProyectoIntegrador2018/arquidiocesis-back.git
```
3. Install [nodemon](https://www.npmjs.com/package/nodemon):

```bash
$ npm i nodemon --save-dev
```


### Running the stack for Development
#### MacOS
1. Open a terminal and run: 
```bash
$ export NODE_ENV=development
```
2. Then run the project using [nodemon](https://www.npmjs.com/package/nodemon): 
```bash
$ nodemon index.js
```

That command will open the server on port 8000 by default.

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
$ node index.js 
```
