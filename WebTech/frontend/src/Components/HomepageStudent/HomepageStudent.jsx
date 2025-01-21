import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './HomepageStudent.css';

const HomepageStudent = () => {
  const { mail } = useParams();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch active sessions
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:7000/sessions');
        setSessions(response.data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  // Function to handle row click
  const handleRowClick = (session) => {
    setSelectedSession(session);
    setShowModal(true);
  };

  // Function to handle enrollment
  
  const handleEnroll = async () => {
    try {
      const response = await axios.post('http://localhost:7000/enroll', {
        profEmail: selectedSession.profEmail,  // Send the professor's email
        studentEmail: mail,                    // Send the student's email
      });
  
      console.log("Enrolled successfully:", response.data);
      alert("You have been successfully enrolled in the session!");
      setShowModal(false);
    } catch (error) {
      console.error("Error enrolling:", error);
      alert(error.response ? error.response.data : "Failed to enroll. Please try again.");
    }
  };

  return (
    <div className="homepageStudent-container">
      <h1 id="ID">Welcome, Student! Your email is: {mail}</h1>

      <div className="table-container">
        <h2>Available Sessions</h2>
        <table>
          <thead>
            <tr>
              <th>Professor Name</th>
              <th>Professor Email</th>
              <th>Available Spots</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? (
              sessions.map((session, index) => (
                <tr key={index} onClick={() => handleRowClick(session)}>
                  <td>{session.profName}</td>
                  <td>{session.profEmail}</td>
                  <td className="available-spots"
                  style={{
                    color: session.availableSpots === 0 ? 'red' : 'inherit',
                    fontWeight: session.availableSpots === 0 ? 'bold' : 'normal',
                  }}>{session.availableSpots}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  No active sessions available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for enrollment confirmation */}
      {showModal && selectedSession && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enroll in Session</h2>
            <p>Are you sure you want to enroll in the session with:</p>
            <p><strong>Professor Name:</strong> {selectedSession.profName}</p>
            <p><strong>Professor Email:</strong> {selectedSession.profEmail}</p>
            <p><strong>Available Spots:</strong>{' '}
              <span style={{ color: selectedSession.availableSpots === 0 ? 'red' : 'inherit', fontWeight: selectedSession.availableSpots === 0 ? 'bold' : 'normal' }}>
                {selectedSession.availableSpots}
              </span></p>
              <div className="modal-buttons">
              <button onClick={handleEnroll} className="yes-button">Yes</button>
              <button onClick={() => setShowModal(false)} className="no-button">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageStudent;
