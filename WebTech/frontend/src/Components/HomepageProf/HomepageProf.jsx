import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios'; // Import axios for making API requests
import { useNavigate } from 'react-router-dom';
import './HomepageProf.css';

const HomepageProf = () => {
  const { mail } = useParams();
  const [sessionId, setSessionId] = useState('');
  const [maxStudents, setMaxStudents] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // This should be inside the functional component

  const handleAddSession = async () => {
    try {
      setErrorMessage('');
      setSuccessMessage('');
      const newSession = {
        sessionId: sessionId,
        profEmail: mail,  // Use the professor's email from the URL
        maxStudents: maxStudents,
        students: [] // Initially, no students are assigned
      };

      // Send the new session data to the backend
      const response = await axios.post('http://localhost:7000/sessions', newSession);

      if (response.status === 200) {
        setSuccessMessage('Session added successfully!');
        setSessionId('');
        setMaxStudents('');
        navigate(`/StudentsWhoWantToEnroll/${mail}`); // Replace '/anotherPage' with the desired route
      }
    } catch (error) {
      if (error.response && error.response.status===400) {
      setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred while adding the session.');
      }
    }
  };

  return (
    <div className='homepageProf-container'>
      <h1 id='ID'>Welcome, Professor! Your email is: {mail}</h1>

      {/* Form for adding a new session */}
      <div className="session-form">
        <label htmlFor="sessionId">Session ID: </label>
        <input 
          type="text" 
          id="sessionId" 
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)} 
        />
        <br />
        
        <label htmlFor="maxStudents">Max Students: </label>
        <input 
          type="number" 
          id="maxStudents" 
          value={maxStudents}
          onChange={(e) => setMaxStudents(e.target.value)} 
        />
        <br />

        <button onClick={handleAddSession}>Add Session</button>
      </div>

      {/* Success/Error Messages */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default HomepageProf;
