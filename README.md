# Trial Shift

## Overview

This project is a web application built using Node.js, Vanilla JavaScript, HTML & CSS (Materialize), and MongoDB. It follows the MVC (Model-View-Controller) architecture, ensuring a clear separation of concerns.


## Running the Application with Docker

1. Build the image:
   ```bash
   docker build -t trial-shift:latest .
   ```
2. Run the container 
   ```bash
   docker run --env-file .env -p 5001:5001 trial-shift:latest
   ```
3. Open the app at `http://localhost:5001`.

### Verify /api/student inside the container
```bash
curl http://localhost:5001/api/student
```
Expected response:
```json
{
  "name": "Piyum Sugandha Kapurubandara Arachchige Don",
  "studentId": "225279848"
}
```
