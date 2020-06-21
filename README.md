# apollo-express-graphql-mongo-backend-api-starter-project

A full-fledged Apollo Server with mongodb with Apollo Client starter project. I have broken this into two repositiories.

Server application core technology stack:

- apollo-server
- graphql
- expresss
- Mongodb

## Features of Server

- Appollo server
  - Queries, Mutations
- Node.js with Express and Apollo Server
- MongoDB Database with Mongoose
- Logging errors and services
- Graphql playground to view services and data

## Api Service

- Authentication

  - Passportjs, access tokens
  - Sign Up, Sign In, Sign Out

- Authorization

  - Protected endpoint - required valid token to proceed
  - Protected resolvers (e.g. e.g. session-based, role-based)
  - Protected routes (e.g. session-based, role-based)

- Core service

  - Admin

    - Create new user
    - List users
    - Get user details
    - Delete user
    - Create new product for users
    - Delete product for news
    - Edit product

  - User
    - List of users
    - List of products
    - Get product details
      - filter list of products
    - Create new product
    - Delete product
    - Edit product

- E2E testing

  - Testing core api responses
    - Authentication
    - API service
    - Api responses from apollo service

- Unit testing
  - Testing core functionality
  - [Todo] - write more unit tests on core functionality for more test coverage

## Installation

`git clone https://github.com/ishouty/apollo-express-graphql-mongo-backend-api-starter-project.git`

`cd apollo-express-graphql-mongo-backend-api-starter-project`

#### .env file

evironenment variables are used to store passwords and config directory paths, which can be changed etc..

`cp _config.env src/config/dev.env`
`cp _config.env src/config/production.env`

`npm install`

## logging directory and path

You need to update the .env file with the right paths for logging and any other details such as port.

Note: If you are logging into the files please make sure you set the permissions for this to make sure logger is able to write to log directory.

## .env file

Below are the environment variables which are used and can be updated based on different environments,e

```
ENVIRONMENT=dev  ## type of environment
PORT=8080 ## port of the service
DATABASE_URL=mongodb://localhost:27017/test-apollo ## url of the service

LOGGER_LEVEL=debug ## logging level
LOGGER_LEVEL_CONSOLE=debug
LOGGER_FILE=/logs/all.log ## path to the log file general
ERROR_LOGGER_FILE=/logs/error.log ## path to error file
LOGGER_MAX_FILE_SIZE=5242880 ## max size of logs
LOGGER_MAX_FILES=2

TOKEN_LIFE=86400 ## access token life authentication system
LOGIN_BLOCK_CONCURRENT_LOGIN=false ## multiple login access
LOGIN_ATTEMPTS=3 ## login attempts

```

Fill out dev.env e.g src/config/dev.env with your database and config settings

#### Mongo db and migration script

start MongoDB [Google how to set up]

- create a with a collection and name the database.
- call migration script to port over some basic users into database. This should port all the required data to start the basic service. e.g mock data and admin user.
- Make sure the script is pointing to the right database before calling this (name the database to the one you created). You can modify and update this. It will generate admin users and some fake products.

  - `cd apollo-express-graphql-mongo-backend-api-starter-project`
  - `npm run init-script`

Since this boilerplate project is using MongoDB, you have to install it for your machine and get a database up and running locally.

#### start service

- start service - Once you have imported the data successfully you can start the service depending on the environment.

  - `npm start` to start production version
  - `npm run dev` to start the development version

#### playaround

- Goto browser visit `http://localhost:8080/graphql` for GraphQL playground
- You will need to be authenticated in order to make any requests
- Use postman or curl user http://localhost:8080/api/login
  - In the body of the request -> POST REQUEST - use these details from migration script
    `{ "client_id": "android", "grant_type": "password", "client_secret" : "SomeRandomCharsAndNumbers", "username" : "admin@test.com", "password": "Test@1234" }`
  - This should return you a access token which you can be used within graphql playground
- GraphQl playground
  - You will need to enter the access token and paste the entire part in the tab HTTP HEADERS
  - `{ "Authorization" : "Bearer {{ Access_token }}", "clientId": "android" }`

#### End to end testing

- Edit the port of graphql url to your setup
  - tests/apiResponses/api.js

```
const BASE_URL = 'http://localhost:8080'
const API_URL = '/api'
const APOLLO_URL = `/graphql`
```

- `cd apollo-express-graphql-mongo-backend-api-starter-project`
- `npm run jest`
- Developing unit tests
  - If you are developing unit tests you can use command below. This will watch any changes within the directory.
  - `npm run test:watch`

* E2E and Unit tests will run :
  - End to End tests
  - Unit test coverage

### TODO: Future Improvements/Refactoring/Features

- update more unit tests to get more coverage on the service
- docker script

- Authentication with social media platforms
- Editing users
