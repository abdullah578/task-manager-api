## Description

A REST API with user accounts and authentication, built with node, express, and MongoDB. Included features such as file upload and email sending

## API endpoints

**Users**

POST /users - create a new user account \
POST /users/login -login and get auth token \
POST /users/logout - logout and remove auth token \
POST /users/me/avatar - upload an image as a profile picture \
GET /users/me - get user information <br/>
PATCH /users/me - update user information \
DELETE /users/me/avatar -delete profile picture \
DELETE /users/me - delete user account 

**Tasks**

POST /tasks - create a new task \
GET /tasks - get all tasks for current user \
GET /tasks/:id - get task by id \
PATCH /tasks/:id - update task by id \
DELETE /tasks/:id - delete task by id  
