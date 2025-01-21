// src/Components/Register/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


function Register() {
  // State variables for storing form data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate hook to programmatically navigate
  

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Reset error message

    try {
      const response = await axios.post('http://localhost:7000/students', {
        name,
        email,
        password
      });

      alert(response.data.message); // Success message
      navigate('/'); // Navigate to the first page
    } catch (err) {
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message); // Display the error from the server
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register student</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name: </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email: </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
