// src/setupTests.js
// Mock CSS imports
jest.mock('./index.css', () => ({}), { virtual: true });
jest.mock('./components/SearchBar.css', () => ({}), { virtual: true });
jest.mock('./components/PropertyCard.css', () => ({}), { virtual: true });
jest.mock('./components/PropertyList.css', () => ({}), { virtual: true });
jest.mock('./components/ChatBot.css', () => ({}), { virtual: true });
jest.mock('./components/NavBar.css', () => ({}), { virtual: true });
jest.mock('./components/Footer.css', () => ({}), { virtual: true });
jest.mock('./components/Profile.css', () => ({}), { virtual: true });
jest.mock('./components/BackToTop.css', () => ({}), { virtual: true });
jest.mock('./components/Pagination.css', () => ({}), { virtual: true });
jest.mock('./components/ChatBotToggle.css', () => ({}), { virtual: true });