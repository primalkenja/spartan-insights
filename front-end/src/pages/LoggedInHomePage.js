import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInListingsPage from './LoggedInListingsPage';
import './LoggedInHomePage.css';

const LoggedInHomePage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="logged-in-container">
      <header>
        <h1>Spartan Insights</h1>
        <div className="header-button">
          <button onClick={handleLogout}>Log Out</button>
        </div>
      </header>

      <main className="main-content">
        <LoggedInListingsPage setIsLoggedIn={setIsLoggedIn} />
      </main>
    </div>
  );
};

export default LoggedInHomePage;