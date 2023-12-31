﻿
# cometLabs-Coding-platform



## Run Locally

Clone the project

```bash
  git clone https://github.com/VSArchive/COMETLABS-Assessment.git
```
Install dependencies

```bash
  npm install
```

Start the server

```bash
  node index
```

## Link for API

### https://cometlabscode.onrender.com

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGODB_URL`  `SUBMISSION_URL`  `TOKEN`  
`PROBLEM_URL`  `JWT_ACCESS_TOKEN`  
`JWT_REFRESH_TOKEN`


## Tech Stack

**Server:** Node, Express, JWT Tokens, Bcrypt, Render


## Screenshots
- ## Login And Signup
- ### Adding new user to database
![signup](./readmeImages/signup.png)

- ### User login
![signup](./readmeImages/login.png)

- ### User logout using refersh token
![signup](./readmeImages/logout.png)

- ### Middleware to chack if user is admin
![signup](./readmeImages/home.png)

- ## Question Management

- ### Displaing questions in Sphere's database
![signup](./readmeImages/display-questions.png)

- ### Adding User defined new question
![signup](./readmeImages/add-new-question.png)

- ### Updating question
![signup](./readmeImages/update-question.png)

- ### Deleting Question
![signup](./readmeImages/delete-question.png)

- ## Testcase Management

- ### Adding testcase to that question
![signup](./readmeImages/add-testcases.png)

- ### Updating testcases
![signup](./readmeImages/update-testcases.png)

- ### Loding all the test cases
![signup](./readmeImages/preload-testcase.png)

- ## Submition Management

- ### User submiting test
![signup](./readmeImages/submit-code.png)

- ### All submitions
![signup](./readmeImages/all-submitions.png)

- ### Submition by a specific user
![signup](./readmeImages/user-sub.png)

- ### All Submition respective to question
![signup](./readmeImages/question-sub.png)
