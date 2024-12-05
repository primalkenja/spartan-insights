import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ListingsPage.css';

const PublicListingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialSearchQuery = queryParams.get('query') || '';
  const initialView = queryParams.get('view') || 'professors';

  const [activeView, setActiveView] = useState(initialView);
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery); 

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [professorsRes, coursesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/professors', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/courses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setProfessors(professorsRes.data);
        setCourses(coursesRes.data);
      } catch (err) {
        setError('Failed to fetch data.');
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
      fetchAllData();
    } else if (activeView === 'courses') {
      fetchCourses();
    }
  }, [activeView]);

  // Update URL when search query changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }
    params.set('view', activeView);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [searchQuery, activeView, navigate, location.pathname]);

  const filterItems = (items, query, type) => {
    if (!query.trim()) return items;
    const searchTerm = query.toLowerCase();

    if (type === 'professors') {
      return items.filter(
        (professor) =>
          professor.name.toLowerCase().includes(searchTerm) ||
          professor.department.toLowerCase().includes(searchTerm)
      );
    }

    if (type === 'courses') {
      return items.filter(
        (course) =>
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
      const courseMatches = courses.some(course => 
        (course.prefix + ' ' + course.number).toLowerCase().includes(searchTerm) ||
        course.name.toLowerCase().includes(searchTerm) ||
        (course.description || '').toLowerCase().includes(searchTerm)
      );
      
      if (courseMatches) {
        setActiveView('courses');
      }
    } else {
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
      const currentResults = filterItems(
        activeView === 'professors' ? professors : courses,
        searchQuery,
        activeView
      );

      if (currentResults.length === 0) {
        const otherView = activeView === 'professors' ? 'courses' : 'professors';
        const otherResults = filterItems(
          otherView === 'professors' ? professors : courses,
          searchQuery,
          otherView
        );

        if (otherResults.length > 0) {
          setError(`No results in ${activeView}. Try searching in ${otherView}.`);
        } else {
          setError('No results found in either tab.');
        }
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  }, [searchQuery, professors, courses, activeView]);

  useEffect(() => {
    if (initialSearchQuery) {
      const searchTerm = initialSearchQuery.toLowerCase();
      
      const professorMatches = professors.some(professor => 
        professor.name.toLowerCase().includes(searchTerm) ||
        professor.department.toLowerCase().includes(searchTerm)
      );
      
      const courseMatches = courses.some(course => 
        (course.prefix + ' ' + course.number).toLowerCase().includes(searchTerm) ||
        course.name.toLowerCase().includes(searchTerm) ||
        (course.description || '').toLowerCase().includes(searchTerm)
      );
  
      // If there are only course matches, switch to courses tab
      if (!professorMatches && courseMatches) {
        setActiveView('courses');
      }
      // If there are only professor matches, switch to professors tab
      else if (professorMatches && !courseMatches) {
        setActiveView('professors');
      }
    }
  }, [professors, courses, initialSearchQuery]);

  const renderProfessors = () => {
    const filteredProfessors = filterItems(professors, searchQuery, 'professors');
    return filteredProfessors.length > 0 ? (
      filteredProfessors.map((professor) => (
        <button
          key={professor._id}
          className="professor-item"
          onClick={() => navigate(`/professors/${professor._id}`)}
        >
          <div className="professor-details">
            <p className="professor-name">{professor.name}</p>
            <p className="professor-department">Department: {professor.department}</p>
          </div>
        </button>
      ))
    ) : (
      <p>No professors found matching your search.</p>
    );
  };

  const renderCourses = () => {
    const filteredCourses = filterItems(courses, searchQuery, 'courses');
    return filteredCourses.length > 0 ? (
      filteredCourses.map((course) => (
        <button
          key={course._id}
          className="course-item"
          onClick={() => navigate(`/courses/${course._id}`)}
        >
          <div className="course-details">
            <h3 className="course-title">
              {`${course.prefix || 'N/A'} ${course.number || '000'} - ${
                course.name || 'Unnamed Course'
              }`}
            </h3>
            <p className="course-description">{course.description || 'No description available.'}</p>
          </div>
        </button>
      ))
    ) : (
      <p>No courses found matching your search.</p>
    );
  };

  const renderList = () => {
    if (activeView === 'professors') {
      return (
        <>
          <h2>Professors</h2>
          <div className="list-container">{renderProfessors()}</div>
          <div className="login-prompt">
            <p>
              Want to rate professors?{' '}
              <button onClick={() => navigate('/login')}>Log In</button> or{' '}
              <button onClick={() => navigate('/signup')}>Sign Up</button>
            </p>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h2>Courses</h2>
          <div className="list-container">{renderCourses()}</div>
          <div className="login-prompt">
            <p>
              Want to rate courses?{' '}
              <button onClick={() => navigate('/login')}>Log In</button> or{' '}
              <button onClick={() => navigate('/signup')}>Sign Up</button>
            </p>
          </div>
        </>
      );
    }
  };

  // Calculate filtered results for the count display
  const filteredProfessors = filterItems(professors, searchQuery, 'professors');
  const filteredCourses = filterItems(courses, searchQuery, 'courses');

  return (
    <div className="listings-page">
      <header className="main-header">
        <div className="header-nav">
          <h1>Spartan Insights</h1>
        </div>
        <button className="back-home-button" onClick={() => navigate('/')}>
          Home
        </button>
      </header>

      <main>
        <div className="search-bar">
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
            onClick={() => setActiveView('professors')}
            className={activeView === 'professors' ? 'active' : ''}
          >
            Professors {filteredProfessors.length > 0 && `(${filteredProfessors.length})`}
          </button>
          <button
            onClick={() => setActiveView('courses')}
            className={activeView === 'courses' ? 'active' : ''}
          >
            Courses {filteredCourses.length > 0 && `(${filteredCourses.length})`}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        {renderList()}
      </main>
    </div>
  );
};

export default PublicListingsPage;