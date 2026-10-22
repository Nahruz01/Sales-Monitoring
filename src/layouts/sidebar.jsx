import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <>
      {/* Inject embedded styles directly into the document head */}
      <style>{`
        :root {
          --sidebar-width: 250px;
          --sidebar-bg: #1e293b;
          --sidebar-text: #f8fafc;
          --sidebar-hover: #334155;
          --header-bg: #ffffff;
          --body-bg: #f1f5f9;
          --transition-speed: 0.3s;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--body-bg);
          color: #0f172a;
        }

        .layout-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
        }

        /* Sidebar Styling */
        .sidebar {
          width: var(--sidebar-width);
          background-color: var(--sidebar-bg);
          color: var(--sidebar-text);
          display: flex;
          flex-direction: column;
          transition: margin-left var(--transition-speed) ease-in-out;
          z-index: 100;
        }

        .sidebar.closed {
          margin-left: calc(-1 * var(--sidebar-width));
        }

        .sidebar-header {
          padding: 20px;
          font-size: 1.2rem;
          font-weight: bold;
          border-bottom: 1px solid #334155;
        }

        .sidebar-nav {
          padding: 15px 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nav-item {
          padding: 12px 16px;
          color: var(--sidebar-text);
          text-decoration: none;
          border-radius: 6px;
          font-size: 0.95rem;
          transition: background-color 0.2s;
          cursor: pointer;
        }

        .nav-item:hover, .nav-item.active {
          background-color: var(--sidebar-hover);
        }

        /* Main Area */
        .main-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* Header */
        .main-header {
          height: 60px;
          background-color: var(--header-bg);
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          padding: 0 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .toggle-btn {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          color: #334155;
          transition: background-color 0.2s;
        }

        .toggle-btn:hover {
          background: #e2e8f0;
        }

        /* Content Body */
        .main-content {
          padding: 24px;
          flex: 1;
        }
      `}</style>

      <div className="layout-container">
        {/* Sidebar */}
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            Sales Monitoring
          </div>
          <nav className="sidebar-nav">
            <Link to="/" className="nav-item">Dashboard</Link>
            <Link to="/saleslog" className="nav-item">Sales Log</Link>
            <Link to="/test-api" className="nav-item">Test API</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="main-wrapper">
          <header className="main-header">
            <button className="toggle-btn" onClick={toggleSidebar}>
              {isOpen ? '◀ Hide Sidebar' : '▶ Show Sidebar'}
            </button>
          </header>

          <main className="main-content">
            {children || <h2>Dashboard Content Goes Here</h2>}
          </main>
        </div>
      </div>
    </>
  );
}