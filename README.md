# Contact Manager Application

## Overview
This Contact Manager is a dynamic, single-page web application that allows users to create, read, update, and delete contact information. It provides a user-friendly interface for managing personal or professional contacts efficiently.

## Features
- Add new contacts with name, email, phone number, and tags
- View a list of all contacts
- Edit existing contact information
- Delete contacts
- Tag-based organization and filtering
- Form validation for data integrity

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Handlebars.js (for templating)
- RESTful API integration

## Concepts Implemented
- Single Page Application (SPA) architecture
- Asynchronous JavaScript (Async/Await)
- DOM manipulation
- Event delegation
- Template rendering
- Form handling and validation
- CRUD operations
- Error handling
- Responsive design

## Getting Started
1. Clone the repository.
2. In the project's root directory run:
  - `npm install` to install the dependancies.
  - `npm start` to start the server.
3. Open `http://localhost:3000/` in a modern web browser.
4. Enjoy!

## API Endpoints
- **GET** `/api/contacts` - Retrieve all contacts
- **POST** `/api/contacts` - Create a new contact
- **GET** `/api/contacts/:id` - Retrieve a specific contact
- **PUT** `/api/contacts/:id` - Update a specific contact
- **DELETE** `/api/contacts/:id` - Delete a specific contact

## Future Enhancements
- Add pagination for large contact lists.
- Integrate with cloud storage for data persistence.
- Implement user authentication and personal contact lists.

