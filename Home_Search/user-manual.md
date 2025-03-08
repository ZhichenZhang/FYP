# Home Search - User Manual

## Table of Contents
1. [System Requirements](#1-system-requirements)
2. [Installation](#2-installation)
3. [Running the Application](#3-running-the-application)
4. [Features](#4-features)
5. [Troubleshooting](#5-troubleshooting)

## 1. System Requirements

### Hardware Requirements
- Any modern computer capable of running a web browser and Node.js
- Minimum 4GB RAM recommended
- 1GB free disk space

### Software Requirements
- Node.js (v16 or higher)
- Python 3.10 or higher
- Web browser (Chrome, Firefox, Edge, or Safari)

## 2. Installation

### Clone the Repository
```bash
git clone https://github.com/ZhichenZhang/project.git
cd Home_Search
```

### Backend Setup
```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup
```bash
cd home-search-frontend

# Install dependencies
npm install
```

## 3. Running the Application

### Starting the Application

#### Start the Backend
```bash
cd backend
# Activate virtual environment if not already active
python app.py
```
The backend server will start at http://127.0.0.1:5000

#### Start the Frontend
```bash
cd home-search-frontend
npm start
```
The frontend application will open automatically in your default browser at http://localhost:3000

### Stopping the Application
- Frontend: Press `Ctrl+C` in the terminal where the frontend is running
- Backend: Press `Ctrl+C` in the terminal where the backend is running

## 4. Features

### Property Search
The Home Search application allows you to search for properties using various criteria:

#### Text Search
1. Navigate to the main page
2. Enter your search terms in the search bar (e.g., "3 bedroom house in Dublin")
3. Press Enter or click the search icon
4. Browse through the results using the pagination controls

#### AI Assistant
1. Click the chat icon in the bottom-right corner
2. Type your request in natural language (e.g., "I'm looking for a 3-bed house in Dublin under 400k")
3. The AI will translate your request into search terms and update the property listings

### Property Listings
Each property card displays:
- Property address
- Price
- Number of bedrooms and bathrooms
- Property type
- Floor area
- BER energy rating
- Date listed

You can click "View on Daft.ie" to see the original listing or "View on Map" to see the location.

### Favorites
To save properties for later viewing:

1. Click the heart icon on any property card to add it to your favorites
2. Navigate to the "Favorites" page using the navigation bar to view your saved properties
3. Click the heart icon again to remove a property from your favorites

Favorites are stored locally in your browser and will persist between sessions.

### Navigation
- Use the navigation bar at the top to switch between Properties, Favorites, and Profile pages
- Use the "Back to Top" button (appears when scrolling down) to quickly return to the top of the page

## 5. Troubleshooting

### Common Issues

#### Backend Connection Error
If you see "Error fetching properties" on the frontend:
1. Check that the backend server is running
2. Check the backend terminal for error messages

#### Frontend Not Loading
If the frontend doesn't load properly:
1. Check the browser console for errors
2. Verify that all dependencies were installed correctly
3. Try clearing your browser cache

