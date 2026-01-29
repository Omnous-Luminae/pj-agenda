import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Navbar from './Navbar';
import CalendarPage from './CalendarPage';
import CalendarManagement from './CalendarManagement';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
  };

  return (
    <Router>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="App">
          <Navbar user={user} onLogout={handleLogout} />
          <div className="app-container">
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/calendars" element={<CalendarManagement user={user} />} />
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;
