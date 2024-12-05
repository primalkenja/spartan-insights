import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ListingsPage.css';

const LoggedInListingsPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialView = queryParams.get('view') || 'professors';

  const [activeView, setActiveView] = useState('professors');
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch both professors and courses when the component mounts
    const fetchAllData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [professorsRes, coursesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/professors', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/courses', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setProfessors(professorsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        setError('Failed to fetch data.');
      }
    };

    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const coursesRes = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(coursesRes.data);
      } catch (err) {
        setError('Failed to fetch courses.');
      }
    };

    if (activeView === 'professors') {
      fetchAllData();
    } else if (activeView === 'courses') {
      fetchCourses();
    }
  }, [activeView]);

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/');
  };

  const filterItems = (items, query, type) => {
    if (!query.trim()) return items;
    
    const searchTerm = query.toLowerCase();
    
    if (type === 'professors') {
      return items.filter(professor => 
        professor.name.toLowerCase().includes(searchTerm) ||
        professor.department.toLowerCase().includes(searchTerm)
      );
    }
    
    if (type === 'courses') {
      return items.filter(course => 
        (course.prefix + ' ' + course.number).toLowerCase().includes(searchTerm) ||
        course.name.toLowerCase().includes(searchTerm) ||
        (course.description || '').toLowerCase().includes(searchTerm)
      );
    }
    
    return items;
  };

  const checkOtherTabForMatches = (query) => {
    if (!query.trim()) return;
  
    const searchTerm = query.toLowerCase();
    
    if (activeView === 'professors') {
      // If we're on professors tab, check courses
      const courseMatches = courses.some(course => 
        (course.prefix + ' ' + course.number).toLowerCase().includes(searchTerm) ||
        course.name.toLowerCase().includes(searchTerm) ||
        (course.description || '').toLowerCase().includes(searchTerm)
      );
      
      if (courseMatches) {
        setActiveView('courses');
      }
    } else {
      // If we're on courses tab, check professors
      const professorMatches = professors.some(professor => 
        professor.name.toLowerCase().includes(searchTerm) ||
        professor.department.toLowerCase().includes(searchTerm)
      );
      
      if (professorMatches) {
        setActiveView('professors');
      }
    }
  };

  useEffect(() => {
    if (searchQuery.trim() !== '') {
      // Check for matches in the current view
      const currentResults = filterItems(
        activeView === 'professors' ? professors : courses,
        searchQuery,
        activeView
      );

      if (currentResults.length === 0) {
        // Check for matches in the other view
        const otherView = activeView === 'professors' ? 'courses' : 'professors';
        const otherResults = filterItems(
          otherView === 'professors' ? professors : courses,
          searchQuery,
          otherView
        );

        if (otherResults.length > 0) {
          // Notify user that matches are in the other tab
          setError(`No results in ${activeView}. Try searching in ${otherView}.`);
        } else {
          setError('No results found in either tab.');
        }
      } else {
        // Clear error if there are results in the current tab
        setError('');
      }
    } else {
      // Clear error when search query is empty
      setError('');
    }
  }, [searchQuery, professors, courses, activeView]);

  const renderNoResultsMessage = () => {
    if (activeView === 'professors') {
      return (
        <div className="no-results-container">
          <p>No professors found matching your search.</p>
          <button
            className="add-button"
            onClick={() => navigate('/home/create-professor')}
          >
            Add Professor
          </button>
        </div>
      );
    } else {
      return (
        <div className="no-results-container">
          <p>No courses found matching your search.</p>
          <button
            className="add-button"
            onClick={() => navigate('/home/create-course')}
          >
            Add Course
          </button>
        </div>
      );
    }
  };

  const renderProfessors = () => {
    const filteredProfessors = filterItems(professors, searchQuery, 'professors');
    
    return filteredProfessors.length > 0 ? (
      filteredProfessors.map((professor) => (
        <button
          key={professor._id}
          className="professor-item"
          onClick={() => navigate(`/home/professors/${professor._id}`)}
        >
          <div className="professor-details">
            <p className="professor-name">{professor.name}</p>
            <p className="professor-department">Department: {professor.department}</p>
          </div>
        </button>
      ))
    ) : (
      searchQuery.trim() !== '' && renderNoResultsMessage()
    );
  };
  
  const renderCourses = () => {
    const filteredCourses = filterItems(courses, searchQuery, 'courses');
    
    return filteredCourses.length > 0 ? (
      filteredCourses.map((course) => (
        <button
          key={course._id}
          className="course-item"
          onClick={() => navigate(`/home/courses/${course._id}`)}
        >
          <div className="course-details">
            <h3 className="course-title">
              {`${course.prefix || 'N/A'} ${course.number || '000'} - ${course.name || 'Unnamed Course'}`}
            </h3>
            <p className="course-description">{course.description || 'No description available.'}</p>
          </div>
        </button>
      ))
    ) : (
      searchQuery.trim() !== '' && renderNoResultsMessage()
    );
  };

  return (
    <div className="listings-page">
      <main>
        <div className="search-container">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              checkOtherTabForMatches(e.target.value);
            }}
            placeholder="Search Course or Professor"
            aria-label="search"
            className="search-input"
          />
        </div>

        <div className="toggle-buttons">
          <button
            className={`transition-button ${activeView === 'professors' ? 'active' : ''}`}
            onClick={() => setActiveView('professors')}
          >
            Professors
          </button>
          <button
            className={`transition-button ${activeView === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveView('courses')}
          >
            Courses
          </button>
        </div>

        <div className="content-section">
          {error && <p className="error-message">{error}</p>}
          <div className="list-container">
            {activeView === 'professors' ? renderProfessors() : renderCourses()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoggedInListingsPage;