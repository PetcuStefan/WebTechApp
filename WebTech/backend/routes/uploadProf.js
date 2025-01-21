const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mySchemas = require('../models/schemas'); // Import the schema model
const Requests = mySchemas.Requests; // Access the Requests model
const Students = mySchemas.Students;

const router = express.Router();
const uploadDir = path.join(__dirname, '..', 'uploadsProf'); // Ensure correct path to the uploads directory

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

const uploadProf = multer({ storage });

// POST route for professors to upload a final PDF
router.post('/uploadProfFile', uploadProf.single('file'), async (req, res) => {
  try {
      // Check if file is uploaded
      if (!req.file) {
          return res.status(400).send('No file uploaded');
      }

      const studentEmail = req.body.studentEmail;

      // Validate student email
      if (!studentEmail) {
          return res.status(400).send('Student email is required');
      }

      // Update the student's record to mark as finalized
      await Students.findOneAndUpdate(
          { email: studentEmail },  // Find the student by their email
          { isFinal: true }          // Mark the student as finalized
      );

      // Find the existing request and update its filePath with the new file
      const request = await Requests.findOne({ studentEmail: studentEmail });

      if (!request) {
          return res.status(404).send('Request not found for this student');
      }

      // Update the filePath for the existing request
      request.filePath = path.join('uploadsProf', req.file.filename);
      await request.save();  // Save the updated request

      res.status(200).send({
          message: 'File uploaded successfully and student marked as finalized',
          filePath: request.filePath,  // Return the updated filePath
      });

  } catch (err) {
      console.error('Error uploading file:', err);
      res.status(500).send({ error: err.message });
  }
});

  
router.get('/downloadRequest/:email', async (req, res) => {
  const { email } = req.params;

  try {
    // Query the student based on their email
    const student = await Students.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Query the associated request data for the student
    const request = await Requests.findOne({ studentEmail: email });

    if (!request || !request.filePath) {
      return res.status(404).json({ error: 'File path not found' });
    }

    // Get the file path from the request data
    const filePath = path.resolve(request.filePath); // Assuming the file is stored relative to the server directory

    // Serve the file for download
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).send('Error downloading the file.');
      }
    });

  } catch (error) {
    console.error('Error fetching file path or student data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;

