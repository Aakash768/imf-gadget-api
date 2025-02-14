## Overview

This project is a backend application built with Node.js, Express, and Prisma. It provides APIs for managing gadgets and users, including functionalities like registration, login, CRUD operations on gadgets, and role-based access control.

## Project Structure
```
prisma/
    migrations/
        20250214081420_init/
            migration.sql
        migration_lock.toml
    prisma.js
    schema.prisma
src/
    config/
    controllers/
        gadget.controller.js
        users.controller.js
    db/
        index.js
    middlewares/
        auth.middleware.js
        role.middleware.js
    routes/
        gadget.routes.js
        users.routes.js
.env
.gitignore
app.js
index.js
package.json
```

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/Aakash768/imf-gadget-api
    cd imf-gadget-api
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

2. The local server will be running on `http://localhost:5000`.
3. It is live on Render 'https://imf-gadget-api-rbkd.onrender.com'.

## Middleware

- **Authentication Middleware**: [`verifyJWT`](vscode-file://vscode-app/c:/Users/aakash/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
- **Role Middleware**: [`checkRole`](vscode-file://vscode-app/c:/Users/aakash/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)

## Controllers

- **Gadget Controller**: [`gadget.controller.js`](vscode-file://vscode-app/c:/Users/aakash/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
- **User Controller**: [`users.controller.js`](vscode-file://vscode-app/c:/Users/aakash/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)

## Database

- **Prisma Client**: [`prisma.js`](vscode-file://vscode-app/c:/Users/aakash/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
- **Database Connection**: [`index.js`](vscode-file://vscode-app/c:/Users/aakash/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)


---
## Main Features:
## **1️⃣ Base URL**

```
https://imf-gadget-api-rbkd.onrender.com/
```

---

## **2️⃣ Authentication & Authorization**

The API uses **JWT-based authentication**. Users must log in to receive a token, which they must include in the `Authorization` header of each request.

### **User Roles & Permissions**

| Role                       | Permissions                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| **Normal User**            | Can view and filter gadgets                                      |
| **Admin**                  | Can view, filter, add, update, delete, and self-destruct gadgets |
| **Database Administrator** | Can change a user’s role to admin (not exposed via API)          |
|                            |                                                                  |

---

### **🔑 Admin Credentials (Pre-Assigned)**

```JSON
{
    "username": "Aakash_Gupta",
    "password": "Aakash@123"
}
```

⚠️ **Note:** Only the **Database Administrator** can change user roles.

---

## **3️⃣ Authentication Endpoints**

|**Category**|**Method**|**Endpoint**|**Description**|
|---|---|---|---|
|**User Routes**|`POST`|`/api/v1/users/register`|Register a new user (default role: user).|
||`POST`|`/api/v1/users/login`|Authenticate user and return a JWT token.|
||`POST`|`/api/v1/users/logout`|Logout the user and clear the session.|
|**Gadget Routes**|`GET`|`/api/v1/gadgets`|Retrieve all gadgets (view & filter).|
||`POST`|`/api/v1/gadgets`|Add a new gadget (Admin only).|
||`PATCH`|`/api/v1/gadgets/:identifier`|Update an existing gadget (Admin only).|
||`DELETE`|`/api/v1/gadgets/:identifier`|Mark a gadget as decommissioned (Admin only).|
||`POST`|`/api/v1/gadgets/:identifier/self-destruct`|Initiate a gadget self-destruction sequence (Admin only).|

This format keeps it clean and easy to reference. Let me know if you need more modifications! 🚀

### **🔹 User Register**

**Endpoint:**
POST
```
/api/v1/users/register
```

**Description:** Registers new user with default : user role

**Request Body:**

```json
{
    "username": "Golu",
    "password": "Golu@123"
}
```

**Response:**

```json
{
    "message": "User registered successfully",
    "user": {
        "id": "6a5502e9-89c9-4a3b-b138-d202f8510ee0",
        "username": "Golu",
        "role": "user",
        "created_at": "2025-02-14T13:45:03.854Z"
    }
}
```


---

### **🔹 User Login**

**Endpoint:**
POST
```
/api/v1/users/login
```

**Description:** Authenticates a user and returns a JWT token.

**Request Body:**

```json
{
    "username": "Golu",
    "password": "Golu@123"
}
```

**Response:**

```json
{
    "message": "User logged in successfully",
    "user": {
        "id": "6a5502e9-89c9-4a3b-b138-d202f8510ee0",
        "username": "Golu",
        "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQi"
}
```


### **🔹 User Logout**

**Endpoint:**
POST
```
/api/v1/users/logout
```

**Description:** Logouts current user and clear the access token.

**Response:**

```json
{
    "message": "User logged out successfully"
}
```



---

## **4️⃣ Gadget Endpoints**

### **🔹 Get All Gadgets**

**Accessible by:** Normal User, Admin
GET
```
/api/v1/gadgets
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Smartwatch X",
      "category": "Wearable",
      "price": 299.99
    }
  ]
}
```

---

### **🔹 Get a All Gadget**

**Accessible by:** Normal User, Admin
GET
```
/api/v1/gadgets
```

**Response:**

```json
[
    {
        "id": "9af14ec5-677d-432d-9a04-3edd24733415",
        "name": "Laser Eyes",
        "codename": "Liable Orange Swordfish",
        "status": "Available",
        "decommissionedAt": null,
        "createdAt": "2025-02-14T09:36:01.773Z",
        "updatedAt": "2025-02-14T09:36:01.773Z",
        "missionSuccessProbability": "82.35%",
        "created_at": "2025-02-14T15:06:01+05:30",
        "updated_at": "2025-02-14T15:06:01+05:30",
        "decommissioned_at": null
    },
    {
        "id": "a195b974-6ac2-46e2-9e5f-fa1163db937c",
        "name": "Crysis Gun",
        "codename": "Fresh Sapphire Crane",
        "status": "Deployed",
        "decommissionedAt": null,
        "createdAt": "2025-02-14T09:44:23.393Z",
        "updatedAt": "2025-02-14T09:44:23.398Z",
        "missionSuccessProbability": "50.75%",
        "created_at": "2025-02-14T15:14:23+05:30",
        "updated_at": "2025-02-14T15:14:23+05:30",
        "decommissioned_at": null
    },
]
```

---

### **🔹 Filter Gadgets**

**Accessible by:** Normal User, Admin
GET
```
/api/v1/gadgets?status=Available
```

**Response:**

```json
[
    {
        "id": "9af14ec5-677d-432d-9a04-3edd24733415",
        "name": "Laser Eyes",
        "codename": "Liable Orange Swordfish",
        "status": "Available",
        "decommissionedAt": null,
        "createdAt": "2025-02-14T09:36:01.773Z",
        "updatedAt": "2025-02-14T09:36:01.773Z",
        "missionSuccessProbability": "93.69%",
        "created_at": "2025-02-14T15:06:01+05:30",
        "updated_at": "2025-02-14T15:06:01+05:30",
        "decommissioned_at": null
    }
	]
```

---

### **🔹 Add a New Gadget**

**Accessible by:** **Admin Only**
POST
```
/api/v1/gadgets
```

**Request Body:**

```json
{
    "name": "Machine Gun",
    "status": "Deployed"
}
```

**Response:**

```json
{
    "id": "43fd1115-cbb7-4a2c-8a5b-6d45146155d1",
    "name": "Machine Gun",
    "codename": "Comprehensive Black Aardvark",
    "status": "Deployed",
    "decommissionedAt": null,
    "createdAt": "2025-02-14T11:02:59.234Z",
    "updatedAt": "2025-02-14T11:02:59.234Z"
}
```

---

### **🔹 Update a Gadget**

**Accessible by:** **Admin Only**
PATCH: either provide `id` or `codename`
```
/api/v1/gadgets/9136adf8-bde4-42fb-b136-caaabcd51e3f
```

**Request Body:**

```json
{
  "status": "Deployed"
}
```

**Response:**

```json
{
    "id": "9136adf8-bde4-42fb-b136-caaabcd51e3f",
    "name": "Watch Dogs",
    "codename": "Symbolic Coral Lark",
    "status": "Deployed",
    "decommissionedAt": null,
    "createdAt": "2025-02-14T09:04:53.440Z",
    "updatedAt": "2025-02-14T11:42:19.661Z"
}
```

---

### **🔹 Delete a Gadget**

**Accessible by:** **Admin Only**
DELETE: either provide Id or codename 
```
/api/v1/gadgets/43fd1115-cbb7-4a2c-8a5b-6d45146155d1
```

**Response:**
**deleting a gadget** sets status to "Decommissioned" rather than removing it.
```json
{
    "id": "9136adf8-bde4-42fb-b136-caaabcd51e3f",
    "name": "Watch Dogs",
    "codename": "Symbolic Coral Lark",
    "status": "Decommissioned",
    "decommissionedAt": "2025-02-14T14:11:58.093Z",
    "createdAt": "2025-02-14T09:04:53.440Z",
    "updatedAt": "2025-02-14T14:11:58.333Z"
}
```

---

### **🔹 Self-Destruct

**Accessible by:** **Admin Only**
By Using Self-Destruct the the status is set to `Destroyed` and a `confirmation code` is visible
```
/api/v1/gadgets/cb6abe66-f007-4d20-9c33-1ba21261fd32/self-destruct
```

**Response:**

```json
{
    "message": "Self-destruct sequence initiated",
    "confirmationCode": "97D139",
    "gadget": {
        "id": "cb6abe66-f007-4d20-9c33-1ba21261fd32",
        "name": "Crysis Gun",
        "codename": "Yeasty Maroon Reptile",
        "status": "Destroyed",
        "decommissionedAt": null,
        "createdAt": "2025-02-14T10:18:07.439Z",
        "updatedAt": "2025-02-14T11:43:30.032Z"
    }
	}
```

---

## **5️⃣ Error Codes**

|Code|Meaning|
|---|---|
|400|Bad Request (Invalid input)|
|401|Unauthorized (Invalid API Key)|
|403|Forbidden (Insufficient Privileges)|
|404|Not Found (Invalid Gadget ID)|
|500|Internal Server Error|

---

## **6️⃣ Rate Limiting**

| Plan         | Limit                 |
| ------------ | --------------------- |
| Free Tier    | 100 requests per hour |

