
# User Management Application

  

The User Management Application is a Node.js and Express.js-based web application for managing users. It provides functionality for user registration, authentication, retrieving user lists, and changing user roles.

  

## Table of Contents

  

- [Installation](#installation)

- [Usage](#usage)

- [Project Structure](#project-structure)

- [Technologies](#technologies)

- [Contributing](#contributing)

- [License](#license)

  

## Installation

  

1. Clone the repository:

  

```bash

$  git  clone  https://github.com/astas2286/incode_test.git

```

  

2. Install the dependencies:

  

```bash

$  cd  user-management-app

$  npm  install

```

  

3. Set up environment variables:

- Create a `.env` file in the root directory.

- Define the required environment variables in the `.env` file. For example:

  

```plaintext

PORT=3000

MONGODB_URI=mongodb://localhost:27017/user-management-db

JWT_SECRET=yourSecretKey

```

The project has my `.env' file, you can use it freely or create your own.

  

4. Start the application:

  

```bash

$  npm  run build
$  npm  start

```

Start the application in development mode:

  

```bash

$  npm  run  dev

```

  

The application will be running at `http://localhost:3000`.

  

## Usage

  

1. Register a new user by sending a POST request to `/api/register`. Provide the required fields in the request body: `username`, `password`, `role`, and `bossId` (optional). Initially, the database is empty and you need to add an "Administrator" (the `boss` field will automatically turn into `null`). Then you can add a "Regular" user. In order for the first "Boss" to appear, when registering the next "Regular" user, in its `boss` field, specify the id of another "Regular" user who should become its `boss`.

  

2. Authenticate a user by sending a POST request to `/api/authenticate`. Provide the `username` and `password` in the request body. On successful authentication, you will receive a JSON Web Token (JWT) in the response.

  

3. Get a list of users by sending a GET request to `/api/users` with a valid JWT in the Authorization header.

  

 4. Change a user's boss by sending a PATCH request to `/api/users/change-boss` with a valid JWT in the Authorization header. Provide the `newBossId` and `regularId` in the request body. Changing rules: 
 - you must be logged in as a "Boss" to change the `boss` of a user; 
- you can only change the `boss` of your own users; 
- if you detach all "Regulars" from you, you become a "Regular" too;
- if you attach your "Regular" to another "Regular" it will turn to "Boss"

  

## Project Structure

  

The project structure follows a typical Node.js and Express.js application architecture:

  

-  `controllers`: Contains the application's route handlers and controller functions.

-  `middleware`: Contains middleware functions used in request processing, such as authentication middleware.

-  `models`: Defines the Mongoose schema for the User model.

-  `routes`: Contains the application's route definitions.

-  `utils`: Contains utility functions, such as the `updateUserRole` function.

-  `server.ts`: The main entry point of the application.

  

## Technologies

  

The User Management Application is built with the following technologies:

  

- Node.js: A JavaScript runtime environment.

- Express.js: A minimal and flexible web application framework for Node.js.

- MongoDB: A NoSQL database used for storing user data.

- Mongoose: An Object Data Modeling (ODM) library for MongoDB and Node.js.

- bcrypt: A library for password hashing.

- jsonwebtoken: A library for generating and verifying JSON Web Tokens.

  

## Contributing

  

Contributions to this project are welcome. If you find any issues or want to add new features, please follow these steps:

  

1. Fork the repository.

2. Create a new branch for your feature: `git checkout -b feature/your-feature-name`.

3. Make your changes and commit them: `git commit -m 'Add some feature'`.

4. Push to the branch: `git push origin feature/your-feature-name`.

5. Submit a pull request detailing your changes.

  