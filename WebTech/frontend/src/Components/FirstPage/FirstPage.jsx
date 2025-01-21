import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import './FirstPage.css';

function FirstPage() {
  return (
    <div className='firstPage-container'>
      <h1>Welcome to the First Page!</h1>
      <div className='buttonsFP-container'>

      {/* Link to navigate to /student */}
      <Link to="/loginStudent">
        <button id='bt1'>Student</button>
      </Link>

      {/* Link to navigate to /professor */}
      <Link to="/loginProf">
        <button id='bt2'>Professor</button>
      </Link>
      </div>
    </div>
  );
}

export default FirstPage;
