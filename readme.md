
## Overview

This project is a backend application built with Node.js, Express, and Prisma. It provides APIs for managing gadgets and users, including functionalities like registration, login, CRUD operations on gadgets, and role-based access control.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Aakash768/imf-gadget-api
    cd backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    - Create a .env file in the root directory and add the following:
        ```
        PORT=5000
        JWT_SECRET=your_jwt_secret
        JWT_EXPIRES_IN=1h
        DATABASE_URL="your_database_url"
        ```

4. Set up the database:
    - Ensure PostgreSQL/ORM-Prisma is running.
    - Update the `DATABASE_URL` in the `.env` file with your PostgreSQL connection string.
    - Run Prisma migrations:
        ```sh
        npx prisma migrate dev
        ```

## Running the Project

1. Start the server:
    ```sh
    npm run dev
    ```

2. The server will be running on `http://localhost:5000`.

## API Endpoints

### User Routes

- **Register User**: `POST /api/v1/users/register`
- **Login User**: `POST /api/v1/users/login`
- **Logout User**: `POST /api/v1/users/logout`

### Gadget Routes

- **Get Gadgets**: `GET /api/v1/gadgets`
- **Add Gadget**: `POST /api/v1/gadgets`
- **Update Gadget**: `PATCH /api/v1/gadgets/:identifier`
- **Delete Gadget**: `DELETE /api/v1/gadgets/:identifier`
- **Self-Destruct Gadget**: `POST /api/v1/gadgets/:identifier/self-destruct`

## Middleware

- **Authentication Middleware**: [`verifyJWT`](src/middlewares/auth.middleware.js)
- **Role Middleware**: [`checkRole`](src/middlewares/role.middleware.js)

## Controllers

- **Gadget Controller**: [`gadget.controller.js`](src/controllers/gadget.controller.js)
- **User Controller**: [`users.controller.js`](src/controllers/users.controller.js)

## Database

- **Prisma Client**: [`prisma.js`](prisma/prisma.js)
- **Database Connection**: [`index.js`](src/db/index.js)

## License

This project is licensed under the ISC License.
2. The server will be running on `http://localhost:5000`.

## API Endpoints

### User Routes

- **Register User**: `POST /api/v1/users/register`
- **Login User**: `POST /api/v1/users/login`
- **Logout User**: `POST /api/v1/users/logout`

### Gadget Routes

- **Get Gadgets**: `GET /api/v1/gadgets`
- **Add Gadget**: `POST /api/v1/gadgets`
- **Update Gadget**: `PATCH /api/v1/gadgets/:identifier`
- **Delete Gadget**: `DELETE /api/v1/gadgets/:identifier`
- **Self-Destruct Gadget**: `POST /api/v1/gadgets/:identifier/self-destruct`

## Middleware

- **Authentication Middleware**: [`verifyJWT`](src/middlewares/auth.middleware.js)
- **Role Middleware**: [`checkRole`](src/middlewares/role.middleware.js)

## Controllers

- **Gadget Controller**: [`gadget.controller.js`](src/controllers/gadget.controller.js)
- **User Controller**: [`users.controller.js`](src/controllers/users.controller.js)

## Database

- **Prisma Client**: [`prisma.js`](prisma/prisma.js)
- **Database Connection**: [`index.js`](src/db/index.js)

## License

This project is licensed under the ISC License.