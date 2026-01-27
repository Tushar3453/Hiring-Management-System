import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react'; 
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
// import RecruiterDashboard from './pages/RecruiterDashboard'; 
import { AuthContext } from './context/AuthContext';

const PrivateRoute = ({ children }: { children: ReactNode }) => { 
  const auth = useContext(AuthContext);
  if (!auth) return null; 

  return auth.token ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="min-h-screen bg-gray-50"> 
        <Routes>
          <Route path="/" element={<div className="p-10 text-center text-3xl font-bold text-gray-700">Welcome to HMS 🚀</div>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/student-dashboard" element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          } />
          
          {/* <Route path="/recruiter-dashboard" element={
            <PrivateRoute>
              <RecruiterDashboard />
            </PrivateRoute>
          } /> */}

        </Routes>
      </div>
    </Router>
  );
}

export default App;