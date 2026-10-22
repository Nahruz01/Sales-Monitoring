import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './layouts/sidebar';
import SalesVisualization from './pages/sale-visualization'; // Import your component

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar>
        
        <Routes>
          {/* Put SalesVisualization inside the Dashboard route */}
          <Route 
            path="/" 
            element={
              <div>
                <h2>Dashboard Overview</h2>
                <p>Welcome to the Sales Monitoring dashboard.</p>
                <SalesVisualization />
              </div>
            } 
          />
          <Route path="/saleslog" element={<h2>Sales Log Table</h2>} />
          <Route path="/test-api" element={<h2>API Testing Panel</h2>} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
}