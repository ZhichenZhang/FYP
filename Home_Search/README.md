# Home Search - Property Search with AI Integration

An intelligent property search platform that combines traditional filtering with AI-powered natural language search capabilities.

## Project Structure
This repository contains a full-stack web application for property search with AI capabilities.

### Folder Structure
- `/backend/`: Flask backend server
  - `app.py`: Main server file and API endpoints
  - `database_utils.py`: MongoDB connection utilities
  - `daft_listings_scraper.py`: Web scraper for property listings
  - `daft_property_details_scraper.py`: Web scraper for property details
  - `requirements.txt`: Python dependencies
  - `/tests/`: Unit and integration tests
- `/home-search-frontend/`: React frontend application
  - `/src/`: Source code
    - `/components/`: React components (PropertyCard, ChatBot, etc.)
    - `/services/`: API services including DeepSeek integration
  - `package.json`: Node.js dependencies
  - `/public/`: Static assets
  - `/cypress/`: End-to-end tests

### Key Dependencies
- **Backend**: Flask, PyMongo, BeautifulSoup4, Python-dotenv
- **Frontend**: React, Axios, React Router, Lucide-react
- **External**: DeepSeek API (for natural language processing)

## 1. System Requirements

### Hardware Requirements
- Any modern computer capable of running a web browser and Node.js
- Minimum 4GB RAM recommended
- 1GB free disk space

### Software Requirements
- Node.js (v16 or higher)
- Python 3.10 or higher
- Web browser (Chrome, Firefox, Edge, or Safari)
- MongoDB (optional if using remote MongoDB)

## 2. Installation

### Clone the Repository
```bash
git clone https://github.com/ZhichenZhang/FYP.git
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

### API Keys Setup
This application requires a DeepSeek API key for the AI assistant functionality:

1. Sign up for a DeepSeek account at https://deepseek.com
2. Generate an API key from your account dashboard
3. Create or modify the `.env` file in the backend folder:
   ```
   MONGO_DB_USERNAME=your_mongodb_username
   MONGO_DB_PASSWORD=your_mongodb_password
   MONGO_DB_CLUSTER_URL=your_mongodb_cluster_url
   MONGO_DB_NAME=your_mongodb_database_name
   REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
   REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
   ```
4. Create or modify the `.env` file in the home-search-frontend folder:
   ```
   REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key
   REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
   ```

## 3. Running the Application

### Compiling the Source Code
The application doesn't require explicit compilation as it uses interpreted languages (Python and JavaScript). The React frontend build process is handled automatically by the npm scripts.

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
3. Verify MongoDB connection settings in the .env file
4. Ensure the API endpoint URLs are correctly configured

#### Frontend Not Loading
If the frontend doesn't load properly:
1. Check the browser console for errors
2. Verify that all dependencies were installed correctly
3. Try clearing your browser cache
4. Make sure Node.js version is compatible (v16+)

#### AI Assistant Not Working
If the AI assistant isn't responding:
1. Verify your DeepSeek API key is correctly set in both .env files
2. Check the browser console for API errors
3. Make sure you have sufficient API quota remaining