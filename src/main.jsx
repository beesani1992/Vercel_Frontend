// frontend/src/main.jsx (or index.js)
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWrapper from './AppWrapper.jsx' // <--- Changed from './App.jsx'
import './index.css' // Your existing CSS file if you have one

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper /> {/* <--- Render AppWrapper here */}
  </React.StrictMode>
)