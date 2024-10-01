import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App.js"; // Importing the App component

const root = ReactDOM.createRoot(document.getElementById("root")); // Create a root for rendering
root.render(
  <React.StrictMode>
    <App /> {/* Rendering the App component */}
  </React.StrictMode>
);
