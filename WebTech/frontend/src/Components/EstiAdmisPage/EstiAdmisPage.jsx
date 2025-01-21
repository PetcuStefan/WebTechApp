import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './EstiAdmisPage.css'; // Ensure you have your styles defined here

// Component definition
const EstiAdmisPage = () => {
  const { mail } = useParams(); // Extract the email from URL parameters
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null); // State to manage the selected file

  useEffect(() => {
    // Fetch student data from the API
    const fetchStudentData = async () => {
      try {
        const response = await fetch(`http://localhost:7000/estiAdmis/${mail}`); // Replace with your backend URL
        
        if (!response.ok) {
          throw new Error(`Failed to fetch student data: ${response.statusText}`);
        }

        const data = await response.json();
        setStudentData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [mail]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  // Handle loading state
  if (loading) return <div>Loading...</div>;

  // Handle error state
  if (error) return <div>Error: {error}</div>;

  // Handle file upload
  const handleSendFile = () => {
    if (!file) {
      alert('Please select a file to upload!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // 'file' should match what your backend expects
    formData.append('studentEmail', mail); // Include the student's email in the form data

    // Send the file to the backend using fetch
    fetch('http://localhost:7000/upload/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response after file upload
        const responseMessageElement = document.getElementById('response-message');
        if (responseMessageElement) {
          responseMessageElement.textContent = data.message || 'File uploaded successfully!';
        }
        console.log('Success:', data);
      })
      .catch((error) => {
        const responseMessageElement = document.getElementById('response-message');
        if (responseMessageElement) {
          responseMessageElement.textContent = 'Error uploading file!';
        }
        console.error('Error:', error);
      });
  };

  const handleDownloadRequest = async () => {
    try {
      // Make a GET request to the backend that will serve the file directly
      const response = await fetch(`http://localhost:7000/uploadProf/downloadRequest/${studentData.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // If the response is not OK, throw an error
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
  
      // Create a blob from the response to force the file download
      const blob = await response.blob();
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      link.href = url;
      link.download = "signed_request.pdf";  // You can dynamically set the file name here
      link.click();
  
      // Revoke the object URL after the download
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('There was an error downloading the file.');
    }
  };
  
  

  return (
    <div>
      {/* Header Section */}
      <div className="header">
        Esti Admis
      </div>

      {/* Main Content Section */}
      <div className="container">
        {studentData ? (
          <>
            <p><strong>Email:</strong> {studentData.email}</p>
            <p><strong>Professor Email:</strong> {studentData.profEmail}</p>
            <p><strong>Professor's Name:</strong> {studentData.professorName}</p>

            {/* Handle based on hasNewUpload and isFinal */}
            {studentData.isFinal ? (
              // If student is final
              <div>
                <p style={{ color: 'white', fontWeight: 'bold' }}>You are final. No further changes allowed.</p>
                {/* Add the "Download Signed Request" button */}
                {studentData.path && (
                  <button onClick={handleDownloadRequest} className="download-button">
                    Download Signed Request
                  </button>
                )}
              </div>
            ) : (
              // If student is not final
              <>
                {studentData.hasNewUpload ? (
                  // If hasNewUpload is true
                  <p style={{ color: 'red', fontWeight: 'bold' }}>Data is processing. Please wait.</p>
                ) : (
                  // If hasNewUpload is false
                  <>
                    <p>No new uploads. You can upload your file as usual.</p>
                    {/* PDF Upload Field */}
                    <div className="file-upload">
                      <label htmlFor="file-upload" style={{ marginRight: '10px', color: 'white' }}>Upload PDF:</label>
                      <input
                        type="file"
                        id="file-upload"
                        name="file-upload"
                        accept=".pdf"
                        onChange={handleFileChange} // Update the state when a file is selected
                        style={{ padding: '5px' }}
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <p className="no-data">No student data found.</p>
        )}
      </div>

      {/* Response Message (file upload result) */}
      <div id="response-message" style={{ color: 'green', marginTop: '20px' }}></div>

      {/* Send File Button (only shown if a file is selected and not final) */}
      {file && !studentData.hasNewUpload && !studentData.isFinal && (
        <div className="send-button-wrapper">
          <button
            onClick={handleSendFile} // Trigger the file send action
            className="send-button"
          >
            Send File
          </button>
        </div>
      )}
    </div>
  );
};

// Export the component for use in other parts of the app
export default EstiAdmisPage;
