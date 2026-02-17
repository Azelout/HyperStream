import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Hyperspeed } from './components/Hyperspeed';
import { Header } from './components/Header';
import { Login } from './pages/Login';
import { RoleSelection } from './pages/RoleSelection';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';

function App() {
  return (
    <AppProvider>
      <Router>
        <Hyperspeed />
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
