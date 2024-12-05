import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateForm.css';

const CreateProfessor = () => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Unauthorized: Please log in to add a professor.');
      }
      await axios.post(
        'http://localhost:5000/api/professors',
        { name, department },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create professor.');
    }
  };

  return (
    <div className="create-form">
      <div className="header-actions">
        <button className="home-button" onClick={() => navigate('/home')}>
          Home
        </button>
      </div>
      <h1>Create Professor</h1>
      <form className="create-form-container" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Professor Name"
            required
          />
        </div>
        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Department"
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateProfessor;