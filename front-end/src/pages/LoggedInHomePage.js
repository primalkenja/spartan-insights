import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoggedInListingsPage from './LoggedInListingsPage';

const LoggedInHomePage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="logged-in-container">
      <header>
        <h1>Spartan Insight</h1>
        <div className="header-button">
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <LoggedInListingsPage setIsLoggedIn={setIsLoggedIn} />
      </main>
    </div>
  );
};

export default LoggedInHomePage;