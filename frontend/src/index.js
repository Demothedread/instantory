import React from 'react';
import ReactDOM from "react-dom";
import reportWebVitals from './reportWebVitals';
import App from './App';
import './index.css'; 
import { createRoot } from 'react-dom';
import { AuthProvider } from "./contexts/AuthContext"; // Ensure this import is correct

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
