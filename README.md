# Simple REST API with Node.js and Express

A beginner-friendly REST API built with **Node.js** and **Express**.
This project demonstrates basic CRUD (Create, Read, Update, Delete) operations on a simple resource.

## Features

- Express server with JSON responses
- Basic routes (`/`, `/about`)
- 404 error handling
- Environment variable support with `dotenv`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

### Installation

1. Clone the repository:

  ```bash
    git clone https://github.com/your-username/simple-rest-api.git
    cd simple-rest-api
  ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```txt
   PORT=3000
   ```

### Running the Project

```bash
npm run dev   # with nodemon
# or
node index.js
```

The server will start on `http://localhost:3000`.

## API Endpoints

* `GET /` → Returns a welcome message
* `GET /about` → About page message
* `*` → 404 JSON response
