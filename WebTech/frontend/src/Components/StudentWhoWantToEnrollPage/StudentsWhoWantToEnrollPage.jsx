import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './StudentsWhoWantToEnrollPage.css';

const AdditionalTable = ({ mail }) => {
  const [studentsWithSessionInfo, setStudentsWithSessionInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false); // New state for the second modal
  const [selectedFile, setSelectedFile] = useState(null); // State for file upload
  const [showFinalModal, setShowFinalModal] = useState(false);  // New state for Finalized modal


  useEffect(() => {
    const fetchStudentsWithSessionInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/getStudentsWithSessionInfo/${mail}`);
        setStudentsWithSessionInfo(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students with session info:', error);
        setLoading(false);
      }
    };

    fetchStudentsWithSessionInfo();
  }, [mail]);

  const handleRowClick = async (student) => {
    setSelectedStudent(student);
  
    if (student.isFinal) {
      setShowFinalModal(true);  // Open final modal for finalized students
    } else if (student.hasNewUpload) {
      setShowModal(true);
  
      try {
        const response = await axios.get(`http://localhost:7000/upload/getStudentFile/${student.email}`, {
          responseType: 'blob',
        });
  
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${student.name}-upload.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  const closeFinalModal = () => {
    setShowFinalModal(false);
    setSelectedStudent(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleAction = async (action) => {
    if (action === 'accept') {
      setShowModal(false);
      setShowUploadModal(true);  // Open the second modal for file upload
    } else if (action === 'deny') {
      try {
        await axios.delete(`http://localhost:7000/upload/deleteRequest/${selectedStudent.email}`);
        await axios.put(`http://localhost:7000/upload/updateHasNewUpload/${selectedStudent.email}`, {
          hasNewUpload: false,
        });

        setStudentsWithSessionInfo((prev) =>
          prev.filter((student) => student.email !== selectedStudent.email)
        );
      } catch (error) {
        console.error(`Error denying student ${selectedStudent.name}:`, error);
      }
      closeModal();
    }
  };

    // Download request file for finalized student
    const handleDownloadRequest = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/upload/getStudentFile/${selectedStudent.email}`, {
       responseType: 'blob',
      });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedStudent.name}-request.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading request file:', error);
  }
};


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('studentEmail', selectedStudent.email);
  
    try {
      await axios.post(`http://localhost:7000/uploadProf/uploadProfFile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      alert('PDF uploaded and student accepted!');
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading professor file:', error);
    }
  };

  const handleBack = () => {
    setShowUploadModal(false);
    setShowModal(true);
  };

  return (
    <div className="table-container">
      <h2>Accepted Students</h2>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Student Email</th>
            <th>Upload</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan="4">Loading...</td></tr>
          ) : studentsWithSessionInfo.length > 0 ? (
            studentsWithSessionInfo.map((student) => (
              <tr
                key={student.email}
                onClick={() => handleRowClick(student)}
                style={{ cursor: student.hasNewUpload ? 'pointer' : 'default' }}
              >
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td className={student.hasNewUpload && !student.isFinal ? 'upload-new' : ''}>
                  {student.hasNewUpload ? 'NEW' : 'N/A'}
                </td>
                <td className={student.isFinal ? 'status-final' : ''}>
                  {student.isFinal ? 'Final' : 'Pending'}
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No data available.</td></tr>
          )}
        </tbody>
      </table>

      {/* First Modal (Accept/Deny) */}
      {showModal && selectedStudent && (
        <div className="modal2">
          <div className="modal-content2">
            <button className="close-button" onClick={closeModal}>✖</button>
            <h3>Student Information</h3>
            <p><strong>Name:</strong> {selectedStudent.name}</p>
            <p><strong>Email:</strong> {selectedStudent.email}</p>
            <p><strong>Upload Status:</strong> {selectedStudent.hasNewUpload ? 'NEW' : 'N/A'}</p>
            <p><strong>Status:</strong> {selectedStudent.isFinal ? 'Finalized' : 'Pending'}</p>
            <div className="modal-actions">
              <button className="accept-button" onClick={() => handleAction('accept')}>Accept</button>
              <button className="deny-button" onClick={() => handleAction('deny')}>Deny</button>
            </div>
          </div>
        </div>
      )}

      {/* Second Modal (File Upload) */}
      {showUploadModal && selectedStudent && (
        <div className="modal2">
          <div className="modal-content2">
            <button className="close-button" onClick={handleBack}>⬅ Back</button>
            <h3>Upload Final PDF for {selectedStudent.name}</h3>
            <input type="file" accept="application/pdf" onChange={handleFileChange} />
            {selectedFile && (
              <button className="upload-button" onClick={handleFileUpload}>
                Accept Student
              </button>
            )}
          </div>
        </div>
      )}

      {/* Finalized Student Modal */}
      {showFinalModal && selectedStudent && (
      <div className="modal2">
       <div className="modal-content2">
         <button className="close-button" onClick={closeFinalModal}>⬅ Back</button>
            <h3>{selectedStudent.name} is already finalized.</h3>
             <p>You cannot make changes to this student.</p>
            <button className="download-button" onClick={handleDownloadRequest}>
              Download Request
        </button>
      </div>
  </div>
)}
    </div>
  );
};
const StudentsWhoWantToEnroll = () => {
  const { mail } = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false); // To control modal visibility
  const [selectedStudent, setSelectedStudent] = useState(null); // To store the selected student
  const navigate = useNavigate(); // This should be inside the functional component

  useEffect(() => {
    // Fetch students who want to enroll when the component mounts
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/studentsWhoWantToEnroll/${mail}`);
        setStudents(response.data); // Set the student data
        setLoading(false); // Stop loading
      } catch (error) {
        console.error('Error fetching students:', error);
        setLoading(false); // Stop loading in case of an error
      }
    };

    fetchStudents();
  }, [mail]); // Run the effect when mail changes

  const HandleStopSession = async () => {
    try {
      // Make a request to your backend to delete the session
      const response = await axios.delete(`http://localhost:7000/stopSession/${mail}`);
      console.log('Session stopped:', response.data);

      // Add any additional logic, such as updating the UI or displaying a confirmation message
      alert('Session successfully stopped!');

      // Navigate to another page (e.g., homepage, dashboard, etc.)
      navigate(`/homepageProf/${mail}`); // Replace '/anotherPage' with the desired route
    } catch (error) {
      console.error('Error stopping session:', error);
      alert('Failed to stop the session. Please try again.');
    }
  };

  // Handle student click to show the modal
  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true); // Show the modal
  };

  const handleYesClick = async () => {
    try {
      // Call the backend to add the student to the session and remove them from the waiting list
      const response = await axios.post(`http://localhost:7000/addStudentToSession/${mail}`, {
        studentEmail: selectedStudent.email,
        professorEmail: mail, // 'mail' should be the professor's email passed via the URL
      });
  
      // Handle success response (e.g., show success message, update UI)
      alert(`You selected ${selectedStudent.name} and they were added to the session. Refresh the page to see the changes`);
      setShowModal(false); // Close the modal
      // Optionally, you can update the UI (e.g., remove the student from the waiting list)
      setStudents(prevStudents => prevStudents.filter(student => student.email !== selectedStudent.email));
  
    } catch (error) {
      console.error('Error adding student to session:', error);
      alert('Failed to process the request. Please try again.');
    }
  };

  // Handle "No" click on the modal
  const handleNoClick = async() => {
    try {
      // Call the backend to add the student to the session and remove them from the waiting list
      const response = await axios.post('http://localhost:7000/deleteStudentFromEnrollment', {
        studentEmail: selectedStudent.email,
        professorEmail: mail, // 'mail' should be the professor's email passed via the URL
      });
  
      // Handle success response (e.g., show success message, update UI)
      alert(`You selected ${selectedStudent.name} and they were added to the session. Refresh the page to see the changes`);
      setShowModal(false); // Close the modal
      // Optionally, you can update the UI (e.g., remove the student from the waiting list)
      setStudents(prevStudents => prevStudents.filter(student => student.email !== selectedStudent.email));
  
    } catch (error) {
      console.error('Error adding student to session:', error);
      alert('Failed to process the request. Please try again.');
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="enrollment-page">
      <h1 id="ID">Welcome, Professor! Your email is: {mail}</h1>

      <div className="enrollment-container">
        {/* Left Table */}
        <div className="table-container">
          <h2>Students Waiting to Enroll</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student Email</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr
                      key={student.email}
                      onClick={() => handleStudentClick(student)} // Show modal when clicked
                    >
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No students are waiting to enroll.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="center-container">
          <button className="stop-session-button" onClick={HandleStopSession}>
            Stop Session
          </button>
        </div>

        {/* Right Table: Render AdditionalTable here and pass `mail` prop */}
        <AdditionalTable mail={mail} />

        {/* Modal for confirming student action */}
        {showModal && (
          <div className="modal">
            <div className="modal-content">
            {/* Close Button */}
          <button 
            className="close-btn" 
            onClick={closeModal}
            title="Close"
          >
            ✖
          </button>
              <h3>Are you sure you want to proceed with {selectedStudent?.name}?</h3>
              <div className="modal-buttons">
                <button className='accept-button' onClick={handleYesClick}>Yes</button>
                <button className='deny-button' onClick={handleNoClick}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentsWhoWantToEnroll;
