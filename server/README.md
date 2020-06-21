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

## Api Service

- Authentication

  - passportjs, access tokens
  - Sign Up, Sign In, Sign Out

- Authorization

  - protected endpoint - required valid token to proceed
  - protected resolvers (e.g. e.g. session-based, role-based)
  - protected routes (e.g. session-based, role-based)

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
    - List user products 
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
  - [Todo] - write more unit tests on core functionality

## Installation

- `git clone repository`
- `cd fullstack-apollo-express-mongodb-boilerplate`
- `touch .env`
- `npm install`
- fill out _.env file_ (see below)
- `npm start`
- [start MongoDB](https://www.robinwieruch.de/mongodb-express-setup-tutorial/)
- visit `http://localhost:8000` for GraphQL playground

#### .env file

Since this boilerplate project is using MongoDB, you have to install it for your machine and get a database up and running. You find everything for the set up over here: [Setup MongoDB with Mongoose in Express Tutorial](https://www.robinwieruch.de/mongodb-express-setup-tutorial) [TODO: write setup tutorial]. After you have created a MongoDB database, you can fill out the environment variables in the _server/.env_ file.

```
SECRET=asdlplplfwfwefwekwself.2342.dawasdq

DATABASE_URL=mongodb://localhost:27017/mydatabase
```

The `SECRET` is just a random string for your authentication. Keep all these information secure by adding the _.env_ file to your _.gitignore_ file. No third-party should have access to this information.

#### Testing

- adjust `test:run-server` npm script with `TEST_DATABASE_URL` environment variable in package.json to match your testing database name
- one terminal: npm run test:run-server
- second terminal: npm run test:execute-test

## Want to learn more about React + GraphQL + Apollo?

- Don't miss [upcoming Tutorials and Courses](https://www.getrevue.co/profile/rwieruch)
- Check out current [React Courses](https://roadtoreact.com)
