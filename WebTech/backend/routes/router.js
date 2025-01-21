const express = require('express');
const router = express.Router();
const schemas = require('../models/schemas');
const { Sessions } = require('../models/schemas');
const { Students } = require('../models/schemas');

// Register a student
router.post('/students', async (req, res) => {
    const { name, email, password } = req.body;

    const data = { name, email, password };

    try {
        // Check if the student already exists
        const existingStudent = await schemas.Students.findOne({ email });
        if (existingStudent) {
            return res.status(400).send({ message: 'Email is already registered' });
        }

        // Create and save the new student
        const newStudent = new schemas.Students(data);
        const saveStudent = await newStudent.save();

        if (saveStudent) {
            return res.status(201).send({ message: 'Student registered successfully!' });
        } else {
            return res.status(500).send({ message: 'Failed to register student.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'An error occurred while registering the student.' });
    }
});

// Register a professor
router.post('/professors', async (req, res) => {
    const { name, email, password } = req.body;

    const data = { name, email, password };

    try {
        // Check if the professor already exists
        const existingProfessor = await schemas.Professors.findOne({ email });
        if (existingProfessor) {
            return res.status(400).send({ message: 'Email is already registered' });
        }

        // Create and save the new professor
        const newProf = new schemas.Professors(data);
        const saveProf = await newProf.save();

        if (saveProf) {
            return res.status(201).send({ message: 'Professor registered successfully!' });
        } else {
            return res.status(500).send({ message: 'Failed to register professor.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'An error occurred while registering the professor.' });
    }
});

router.post('/loginProf', async (req, res) => {
    const { email, password } = req.body;

  try {
    // Check if email exists in the database
    const professor = await schemas.Professors.findOne({ email });

    if (!professor) {
      return res.status(400).send({ message: 'Email not found' });
    }

    // Compare the provided password with the stored plain-text password
    if (professor.password !== password) {
      return res.status(400).send({ message: 'Incorrect password' });
    }

    // If credentials are valid, return a success message
    res.status(200).send({ message: 'Login successful!' });
    

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred during login' });
  }
});



// POST Route for login (authenticating user)
router.post('/loginStudent', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email exists in the database
    const student = await schemas.Students.findOne({ email });

    if (!student) {
      return res.status(400).send({ message: 'Email not found' });
    }

    // Compare the provided password with the stored plain-text password
    if (student.password !== password) {
      return res.status(400).send({ message: 'Incorrect password' });
    }

    // Return student info along with profEmail
    res.status(200).send({
      message: 'Login successful!',
      profEmail: student.profEmail // Send the profEmail in the response
    });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'An error occurred during login' });
  }
});

router.post('/sessions', async (req, res) => {
  const { sessionId, profEmail, maxStudents, studentEmails } = req.body;

  try {
    //Check if there is an active session for the prof
    const existingSession=await schemas.Sessions.findOne({profEmail});
    if(existingSession) {
      return res.status(400).send({message: 'There is already an active session for this email.'});
    }
    // Create a new session entry
    const newSession = new Sessions({
      sessionId,
      profEmail,
      maxStudents,
      studentEmails: []
    });

    // Save the session to the database
    await newSession.save();
    
    res.status(200).json({ message: 'Session added successfully' });
  } catch (error) {
    console.error('Error details:', error); // Log the error for more detail
    res.status(500).json({ message: 'Failed to add session', error: error.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
        // Find all sessions and manually join professor details using email
    const sessions = await Sessions.find();
    // Fetch professor details for each session based on profEmail (email)
    const activeSessions = await Promise.all(sessions.map(async (session) => {
            // Find the professor by email
      const professor = await schemas.Professors.findOne({ email: session.profEmail });
            // Calculate available spots for the session
      const availableSpots = session.maxStudents - (session.students ? session.students.length : 0);
                  // Return session details along with professor's name
      return {
        profEmail: session.profEmail,   // Professor's email (from session)
        profName: professor ? professor.name : 'Unknown',  // Professor's name
        availableSpots,
      };
    }));

    res.status(200).json(activeSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error); // Log more details about the error
    res.status(500).json({ message: 'Failed to fetch sessions', error: error.message });
  }
});

router.post('/enroll', async (req, res) => {
  const { profEmail, studentEmail } = req.body;  // Receive professor email and student email

  try {
    // Find the session(s) that belong to the professor
    const session = await Sessions.findOne({ profEmail: profEmail });

    if (!session) {
      return res.status(404).send("No session found for this professor.");
    }

    // Check if the student is already in the 'studentsWhoWantToEnroll' list
    if (session.studentsWhoWantToEnroll.includes(studentEmail)) {
      return res.status(400).send("Student is already enrolled in this session.");
    }

    // Check if there is space available in the session (based on maxStudents)
    if (session.studentEmails.length >= session.maxStudents) {
      return res.status(400).send("No available spots in this session.");
    }

    // Add the student's email to the session's 'studentsWhoWantToEnroll' list
    session.studentsWhoWantToEnroll.push(studentEmail);

    // Save the session with the updated list
    await session.save();

    res.status(200).send({ message: "Student successfully enrolled in the session." });

  } catch (error) {
    console.error("Error enrolling student:", error);
    res.status(500).send({ message: "Failed to enroll. Please try again." });
  }
});



router.get('/studentsWhoWantToEnroll/:profEmail', async (req, res) => {
  const { profEmail } = req.params;

  try {
    // Find the session for the professor (assuming each professor has only one session)
    const session = await Sessions.findOne({ profEmail });

    if (!session) {
      return res.status(404).json({ message: 'No session found for this professor' });
    }

    // Extract student emails from the studentsWhoWantToEnroll array
    const studentEmails = session.studentsWhoWantToEnroll;

    // If no students are waiting to enroll, return an empty list
    if (studentEmails.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch students from the Students collection who have an empty profEmail field
    const students = await Students.find({
      email: { $in: studentEmails },
      profEmail: ''  // Only fetch students whose profEmail is empty
    });

    // Return the students' details
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students who want to enroll:', error);
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
});



// DELETE endpoint to stop a session
router.delete('/stopSession/:profEmail', async (req, res) => {
  const { profEmail } = req.params;

  try {
    // Find and delete the session with the given professor's email
    const result = await Sessions.deleteOne({ profEmail });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json({ message: "Session successfully stopped" });
  } catch (error) {
    console.error("Error stopping session:", error);
    res.status(500).json({ message: "Failed to stop session" });
  }
});

router.get('/getStudentsWithSessionInfo/:mail', async (req, res) => {
  try {
    const { mail } = req.params;

    // Fetch students with session info
    const students = await Students.find({ profEmail: mail }); // Adjust according to your logic

    const studentsWithInfo = students.map((student) => ({
      name: student.name,
      email: student.email,
      hasNewUpload: student.hasNewUpload, // Directly from the Students collection
      isFinal: student.isFinal // Directly from the Students collection
    }));
    
    res.json(studentsWithInfo);
  } catch (error) {
    console.error('Error fetching students with session info:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




router.post('/addStudentToSession/:profEmail', async (req, res) => {
  const { studentEmail } = req.body;
  const { profEmail } = req.params; // Extract profEmail from the URL

  try {
    // Find the session based on the professor's email
    const session = await Sessions.findOne({ profEmail });

    if (!session) {
      return res.status(404).json({ message: 'Session not found for this professor.' });
    }

    // Check if the student is already in the studentsWhoWantToEnroll array
    const studentIndex = session.studentsWhoWantToEnroll.indexOf(studentEmail);

    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in the enrollment list.' });
    }

    // Add the student to the studentEmails array (enrolled in session)
    session.studentEmails.push(studentEmail);

    // Remove the student from the studentsWhoWantToEnroll array
    session.studentsWhoWantToEnroll.splice(studentIndex, 1);

    //Update maxStudents
    session.maxStudents--;

    // Save the updated session
    await session.save();

    // Now, update the profEmail in the Students table
    const student = await Students.findOne({ email: studentEmail });

    if (!student) {
      return res.status(404).json({ message: 'Student not found.' });
    }

    // Update the profEmail field of the student
    student.profEmail = profEmail;

    // Save the updated student document
    await student.save();

    res.status(200).json({ message: 'Student successfully added to session, removed from waiting list, and profEmail updated.' });
  } catch (error) {
    console.error('Error adding student to session:', error);
    res.status(500).json({ message: 'Error processing the request' });
  }
});

router.post('/deleteStudentFromEnrollment', async (req, res) => {
  const { studentEmail, professorEmail } = req.body;

  try {
    // Find the session based on the professor's email
    const session = await Sessions.findOne({ profEmail: professorEmail });

    if (!session) {
      return res.status(404).json({ message: 'Session not found for this professor.' });
    }

    // Check if the student is already in the studentsWhoWantToEnroll array
    const studentIndex = session.studentsWhoWantToEnroll.indexOf(studentEmail);

    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found in the enrollment list.' });
    }

    // Remove the student from the studentsWhoWantToEnroll array
    session.studentsWhoWantToEnroll.splice(studentIndex, 1);

    // Save the updated session
    await session.save();

    res.status(200).json({ message: 'Student successfully added to session and removed from waiting list' });
  } catch (error) {
    console.error('Error adding student to session:', error);
    res.status(500).json({ message: 'Error processing the request' });
  }
});

router.get('/estiAdmis/:email', async (req, res) => {
  const { email } = req.params;

  try {
    // Query the student data by email
    const student = await Students.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Query the professor's data using the profEmail from the student
    const professor = await schemas.Professors.findOne({ email: student.profEmail });

    if (!professor) {
      return res.status(404).json({ error: 'Professor not found' });
    }

    // Query the Requests table for the current student's file upload details
    let request = await schemas.Requests.findOne({ studentEmail: email });

    if (!request) {
      // If no request data is found, return data without request

      return res.json({
        email: student.email,
        profEmail: student.profEmail,
        professorName: professor.name, 
        hasNewUpload: student.hasNewUpload,
        professorFullName: professor.name,
        isFinal: student.isFinal, // Fetch `isFinal` directly from the `Students` table
      });
    }

    // If request data is found, respond with everything including the request data
    res.json({
      email: student.email,
      profEmail: student.profEmail,
      professorName: professor.name, 
      hasNewUpload: student.hasNewUpload, 
      isFinal: student.isFinal, // Include `isFinal` from `Students` table
      path: request.filePath, // Add the path field from the Requests table
      professorFullName: professor.name 
    });
  } catch (error) {
    console.error('Error fetching student, professor, or request data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});





module.exports = router;
