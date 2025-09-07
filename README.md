# Trial Shift

## Overview
This project is a web application built using Node.js, Vanilla JavaScript, HTML & CSS (Materialize), and MongoDB. It follows the MVC (Model-View-Controller) architecture, ensuring a clear separation of concerns.

## Project Structure
```
group-project
├── src
│   ├── controllers
│   │   └── userController.js
│   ├── models
│   │   └── user.js
│   ├── routes
│   │   └── userRoutes.js
│   ├── views
│   │   ├── index.html
│   │   └── user.html
│   ├── public
│   │   ├── css
│   │   │   └── style.css
│   │   └── js
│   │       └── main.js
│   └── app.js
├── package.json
├── .env
└── README.md
```

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
- Use the user-related functionalities available on the user page.

## Contributing
Feel free to contribute to this project by submitting issues or pull requests. Make sure to follow the coding standards and project structure.

## License
This project is licensed under the MIT License.