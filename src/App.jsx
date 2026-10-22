import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './layouts/sidebar';
import SalesVisualization from './pages/sale-visualization';
import SalesLog from './pages/sale-logs';
import TestApi from './pages/test-api';

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
          <Route path="/saleslog" element={<SalesLog />} />
          <Route path="/test-api" element={<TestApi />} />
        </Routes>
      </Sidebar>
    </BrowserRouter>
  );
}