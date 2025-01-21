import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate for navigation
import axios from 'axios'; // Import axios for making API requests

function LoginProf() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // useNavigate hook for redirecting

  // Function to send login request
  const axiosPostData = async () => {
    try {
      const postData = {
        email: email,
        password: password
      };
  
      const response = await axios.post('http://localhost:7000/loginProf', postData);
  
      if (response.status === 200) {
        // After successful login, check if the professor has any active sessions
        const sessionResponse = await axios.get(`http://localhost:7000/sessions`);
  
        // Check if any session exists with the profEmail
        const session = sessionResponse.data.find(session => session.profEmail === email);
  
        if (session) {
          // If an active session exists, redirect to a different page
          navigate(`/StudentsWhoWantToEnroll/${email}`);  // Replace with the appropriate route
        } else {
          // If no active session exists, redirect to the homepage
          navigate(`/homepageProf/${email}`);
        }
      }
    } catch (error) {
      if (error.response) {
        // If there's an error response from the backend
        setErrorMessage(error.response.data.message);
      } else {
        // General error
        setErrorMessage('An error occurred, please try again.');
      }
    }
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    setErrorMessage(''); // Reset error message on submit
    axiosPostData();
  };

  return (
    <div className="loginProf-container">
      <h2>Login professor</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>

      {/* Show error message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Use Link for navigation to Register page */}
      <div className="registerProf-text">
        <span>Don't have an account?</span>
        <Link to="/registerProf"> Register</Link>
      </div>        
    </div>
  );
}

export default LoginProf;
