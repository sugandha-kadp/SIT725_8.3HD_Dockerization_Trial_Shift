# Trial Shift

## Overview
This project is a web application built using Node.js, Vanilla JavaScript, HTML & CSS (Materialize), and MongoDB. It follows the MVC (Model-View-Controller) architecture, ensuring a clear separation of concerns.

## Project Structure
```
Trial_Shift
├── src
│   ├── controllers
│   │   └── jobController.js
│   │   └── userController.js
│   ├── models
│   │   └── job.js
│   │   └── user.js
│   │   └── category.js
│   ├── routes
│   │   └── jobRoutes.js
│   │   └── userRoutes.js
│   ├── views
│   │   ├── login.html
│   │   ├── job-post.html
│   │   ├── category-counts.html
│   │   └── job-apply.html
│   ├── public
│   │   ├── css
│   │   │   ├── styles.css
│   │   │   └── job-post.css
│   │   └── js
│   │       └── main.js
│   └── app.js
├── package.json
├── .env
└── README.md
```

## Stack
- **Node.js / Express**
- **MongoDB / Mongoose**
- **Materialize CSS**
- **Vanilla JavaScript**
## Setup Instructions


1. **Clone the Repository**
   ```bash
   git clone https://github.com/S224734529/SIT725_Trial_Shift.git
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then run:
   ```bash
   npm install

   npm install express mongoose dotenv jsonwebtoken bcrypt

   npm install multer
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory and add your MongoDB connection string and any other necessary environment variables.

4. **Run the Application**
   Start the server with:
   ```bash
   node src/app.js
   ```
   The application will be running on `http://localhost:5000`.

## Usage
- Navigate to the main page at `http://localhost:5000` to access the application.
Navigate to http://localhost:3000 for the login page.
Use http://localhost:3000/job-post to create, update, or delete job postings.
Use http://localhost:3000/category-counts to view job counts by category.
Use http://localhost:3000/job-apply to apply for available jobs.
- Use the user-related functionalities available on the user page.

## Job Preferences API

- `GET /api/job-preferences` → list current user’s preferences
- `POST /api/job-preferences` → create one
  - body: { preferredLocation, preferredCategories[], programmingLanguages[] }
- `PUT /api/job-preferences/:id` → update one
- `DELETE /api/job-preferences/:id` → delete one
- `DELETE /api/job-preferences` → bulk delete
  - body: { ids: ["...", "..."] }

- Job Management

POST /api/jobs → Create a new job
Body: { title, category, location, shiftDetails }

PUT /api/jobs/:id → Update a job
Body: { title, category, location, shiftDetails }

DELETE /api/jobs/:id → Delete a job
DELETE /api/jobs/bulk → Bulk delete jobs
Body: { jobIds: ["...", "..."] }

GET /api/jobs → List available jobs
POST /api/jobs/apply → Apply for a job
Body: { jobId, applicantName, coverLetter }

- Category Management
GET /api/categories/counts → Get job counts by category

  # Job Preferences App (Node.js + Express + MongoDB)

A simple CRUD app for **Job Preferences** with:
- Create / Read / Update / Delete
- **Bulk delete** with “Select All”
- Fields: `preferredLocation`, `preferredCategories[]`
- UI: **Materialize CSS** ( HTML + vanilla JS)

## Contributing
Feel free to contribute to this project by submitting issues or pull requests. Make sure to follow the coding standards and project structure.

## License
This project is licensed under the MIT License.