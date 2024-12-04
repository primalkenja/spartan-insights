import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ListingsPage.css';

const PublicListingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialView = queryParams.get('view') || 'professors';

  const [activeView, setActiveView] = useState(initialView);
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const professorsRes = await axios.get('http://localhost:5000/api/professors');
        setProfessors(professorsRes.data);
      } catch (err) {
        setError('Failed to fetch professors.');
      }
    };

    const fetchCourses = async () => {
      try {
        const coursesRes = await axios.get('http://localhost:5000/api/courses');
        setCourses(coursesRes.data);
      } catch (err) {
        setError('Failed to fetch courses.');
      }
    };

    if (activeView === 'professors') {
      fetchProfessors();
    } else if (activeView === 'courses') {
      fetchCourses();
    }
  }, [activeView]);

  const renderProfessors = () => {
    return professors.length > 0 ? (
      professors.map((professor) => (
        <div key={professor._id} className="professor-item">
          <div className="professor-details">
            <p className="professor-name">{professor.name}</p>
            <p className="professor-department">Department: {professor.department}</p>
          </div>
          <button
            className="view-details-button"
            onClick={() => navigate(`/professors/${professor._id}`)}
          >
            View Reviews
          </button>
        </div>
      ))
    ) : (
      <p>No professors available.</p>
    );
  };

  const renderCourses = () => {
    return courses.length > 0 ? (
      courses.map((course) => (
        <div key={course._id} className="course-item">
          <div className="course-details">
            <h3 className="course-title">
              {`${course.prefix || 'N/A'} ${course.number || '000'} - ${course.name || 'Unnamed Course'}`}
            </h3>
            <p className="course-description">{course.description || 'No description available.'}</p>
          </div>
          <button
            className="view-details-button"
            onClick={() => navigate(`/courses/${course._id}`)}
          >
            View Reviews
          </button>
        </div>
      ))
    ) : (
      <p>No courses available.</p>
    );
  };

  const renderList = () => {
    if (activeView === 'professors') {
      return (
        <>
          <h2>Professors</h2>
          <div className="list-container">
            {renderProfessors()}
            <div className="login-prompt">
              <p>Want to rate professors? <button onClick={() => navigate('/login')}>Log In</button> or <button onClick={() => navigate('/signup')}>Sign Up</button></p>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h2>Courses</h2>
          <div className="list-container">
            {renderCourses()}
            <div className="login-prompt">
              <p>Want to rate courses? <button onClick={() => navigate('/login')}>Log In</button> or <button onClick={() => navigate('/signup')}>Sign Up</button></p>
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="listings-page">
      <header>
        <div className="header-nav">
          <button className="back-button" onClick={() => navigate('/')}>
            Back to Home
          </button>
          <h1>SJSU Course and Professor Reviews</h1>
          <div className="auth-buttons">
            <button onClick={() => navigate('/login')}>Log In</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </header>

      <main>
        <div className="search-container">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Course or Professor"
            aria-label="search"
            className="search-input"
          />
        </div>

        <div className="toggle-buttons">
          <button
            onClick={() => setActiveView('professors')}
            className={activeView === 'professors' ? 'active' : ''}
          >
            View Professors
          </button>
          <button
            onClick={() => setActiveView('courses')}
            className={activeView === 'courses' ? 'active' : ''}
          >
            View Courses
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {renderList()}
      </main>
    </div>
  );
};

export default PublicListingsPage;