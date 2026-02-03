import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react'; 
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard'; 
import { AuthContext } from './context/AuthContext';
import Home from './pages/Home';
import Profile from './pages/Profile';
import PostJob from './pages/PostJob';
import MyApplications from './pages/MyApplications';
import JobApplications from './pages/JobApplications';
import JobDetails from './pages/JobDetails';

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
         <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/student-dashboard" element={
            <PrivateRoute>
              <StudentDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/recruiter-dashboard" element={
            <PrivateRoute>
              <RecruiterDashboard />
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/job/:jobId/applications" element={<JobApplications />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;