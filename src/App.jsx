import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import VScode from './Components/VScode';
import Login from './Components/Login';
import Register from './Components/RegisterPage';
import './App.css';
import { Terminal } from 'xterm';
import TerminalComponent from './Components/TerminalComponent';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('jwtToken');
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/terminal" element={<TerminalComponent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/vscode" 
          element={
            <PrivateRoute>
              <VScode />
            </PrivateRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
