const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mySchemas = require('../models/schemas'); // Import the schema model
const Requests = mySchemas.Requests; // Access the Requests model
const Students = mySchemas.Students;

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploads'); // Ensure correct path to the uploads directory

// Create 'uploads' folder if not exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create 'uploads' folder if it doesn't exist
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    // Set the filename to current timestamp + original file name
    cb(null, Date.now() + path.extname(file.originalname)); // Ensure unique filenames
  },
});

const upload = multer({ storage });

// POST route to handle file uploads
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    // Get student email from the request body
    const studentEmail = req.body.studentEmail;

    if (!studentEmail) {
      return res.status(400).send('Student email is required');
    }

    // Create a new request entry in the database with the file data
    const newRequest = new Requests({
      studentEmail: studentEmail, // Associate the file with the student's email
      filePath: path.join('uploads', req.file.filename), // Store relative path to the file
    });

    // Save the request in the database
    await newRequest.save();

    // Update the corresponding student record in the Students table
    const updatedStudent = await Students.findOneAndUpdate(
      { email: studentEmail }, // Find the student by email
      { hasNewUpload: true },  // Update the hasNewUpload field to true
      { new: true }            // Return the updated document
    );

    if (!updatedStudent) {
      return res.status(404).send('Student not found');
    }

    res.status(200).send({
      message: 'File uploaded successfully and student record updated',
      file: req.file,
      studentEmail: studentEmail,
      updatedStudent: updatedStudent,
    });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).send({ error: err.message });
  }
});


router.get('/getStudentsWithSessionInfo/:mail', async (req, res) => {
  try {
    const { mail } = req.params;

    // Fetch students with session info (assuming there’s logic to get session data)
    const students = await Students.find({ profEmail: mail }); // Adjust according to your actual logic

    // Check the Requests table for each student's email
    const studentsWithUploadStatus = await Promise.all(students.map(async (student) => {
      const request = await Requests.findOne({ studentEmail: student.email });
      const uploadStatus = request ? 'NEW' : 'N/A'; // Set "NEW" if request exists, else "N/A"
      
      return {
        ...student.toObject(),
        upload: uploadStatus,
        status: 'Pending' // You can adjust the status logic as necessary
      };
    }));

    res.json(studentsWithUploadStatus);
  } catch (error) {
    console.error('Error fetching students with session info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/getStudentFile/:studentEmail', async (req, res) => {
  try {
    const { studentEmail } = req.params;

    // Find the request associated with the student's email
    const request = await Requests.findOne({ studentEmail });

    if (!request || !request.filePath) {
      return res.status(404).send('File not found for this student');
    }

    const filePath = path.resolve(request.filePath); // Absolute path to the file

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found on the server');
      
    }

    // Send the file to the client
    res.download(filePath, `${studentEmail}-upload.pdf`); // Rename the file on download
  } catch (error) {
    console.error('Error fetching student file:', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

router.delete('/deleteRequest/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Delete the request associated with the student's email
    const deletedRequest = await Requests.findOneAndDelete({ studentEmail: email });

    if (!deletedRequest) {
      return res.status(404).send('Request not found');
    }

    res.status(200).send('Request deleted successfully');
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).send('Internal server error');
  }
});

router.put('/updateHasNewUpload/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { hasNewUpload } = req.body;

    // Find the student by email and update the hasNewUpload field
    const updatedStudent = await Students.findOneAndUpdate(
      { email },
      { hasNewUpload },  // Update the hasNewUpload field
      { new: true }  // Return the updated student
    );

    if (!updatedStudent) {
      return res.status(404).send('Student not found');
    }

    res.status(200).send({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
