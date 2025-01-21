import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FirstPage from './Components/FirstPage/FirstPage';
import Login from './Components/Login/Login';
import LoginProf from './Components/LoginProf/LoginProf';
import Register from './Components/Register/Register';
import RegisterProf from './Components/RegisterProf/RegisterProf';
import HomepageStudent from './Components/HomepageStudent/HomepageStudent';
import HomepageProf from './Components/HomepageProf/HomepageProf';
import StudentsWhoWantToEnrollPage from './Components/StudentWhoWantToEnrollPage/StudentsWhoWantToEnrollPage';
import EstiAdmisPage from './Components/EstiAdmisPage/EstiAdmisPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/loginStudent" element={<Login />} />
        <Route path="/loginProf" element={<LoginProf />} />
        <Route path="/registerStudent" element={<Register />} />
        <Route path="/registerProf" element={<RegisterProf />} />
        <Route path="/homepageStudent/:mail" element={<HomepageStudent />} />
        <Route path="/homepageProf/:mail" element={<HomepageProf />} />
        <Route path="/StudentsWhoWantToEnroll/:mail" element={<StudentsWhoWantToEnrollPage />} />
        <Route path="/estiAdmisPage/:mail" element={<EstiAdmisPage />} />
      </Routes>
    </Router>
  );
}

export default App;
