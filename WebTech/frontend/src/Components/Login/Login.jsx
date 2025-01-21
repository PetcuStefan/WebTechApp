// src/Components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for navigation
import axios from 'axios'; // Import axios for making API requests

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const axiosPostData = async () => {
    try {
      const postData = {
        email: email,
        password: password
      };
  
      // Send login credentials to the backend
      const response = await axios.post('http://localhost:7000/loginStudent', postData);
  
      if (response.status === 200) {
        const { profEmail } = response.data; // Assuming profEmail is part of the response
  
        if (profEmail && profEmail !== '') {
          // If profEmail is not empty, redirect to the professor page
          navigate(`/estiAdmisPage/${email}`);
        } else {
          // If profEmail is empty, redirect to the student homepage
          navigate(`/homepageStudent/${email}`);
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
    <div className="login-container">
      <h2>Login student</h2>
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

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {/* Use Link for navigation to Register page */}
      <div className="register-text">
        <span>Don't have an account?</span>
        <Link to="/registerStudent"> Register</Link>
      </div>        
    </div>
  );
}

export default Login;
