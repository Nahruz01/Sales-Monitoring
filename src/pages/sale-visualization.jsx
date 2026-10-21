import React, { useState } from 'react';

export default function SalesVisualization() {
  // Filter state for Date-to-Date timeline
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');

  // Sample data simulating sales based on filters
  const kpiData = {
    total: { count: 1240, units: 4820, value: 145200 },
    delivered: { count: 980, units: 3910, value: 118400 },
    pending: { count: 180, units: 620, value: 19800 },
    cancelled: { count: 80, units: 290, value: 7000 },
  };

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <>
      <style>{`
        .sales-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Filter Bar Styles */
        .filter-bar {
          background: #ffffff;
          padding: 16px 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #475569;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #1e293b;
          outline: none;
          background-color: #f8fafc;
          transition: border-color 0.2s;
        }

        .date-input:focus {
          border-color: #3b82f6;
          background-color: #fff;
        }

        .filter-separator {
          color: #64748b;
          font-weight: 500;
        }

        .filter-btn {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 9px 16px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .filter-btn:hover {
          background-color: #1d4ed8;
        }

        /* KPI Grid Styles */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .kpi-card {
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }

        .kpi-card.total::before { background-color: #3b82f6; }
        .kpi-card.delivered::before { background-color: #10b981; }
        .kpi-card.pending::before { background-color: #f59e0b; }
        .kpi-card.cancelled::before { background-color: #ef4444; }

        .kpi-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-main-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #0f172a;
        }

        .kpi-sub-stats {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
          font-size: 0.85rem;
          color: #475569;
        }

        .sub-stat-item span {
          font-weight: 600;
          color: #1e293b;
        }
      `}</style>

      <div className="sales-container">
        {/* Timeline Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Timeline Filter:</span>
            <input 
              type="date" 
              className="date-input" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
            <span className="filter-separator">to</span>
            <input 
              type="date" 
              className="date-input" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <button className="filter-btn" onClick={() => alert(`Filtering from ${startDate} to ${endDate}`)}>
            Apply Filter
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="kpi-grid">
          {/* Total Orders */}
          <div className="kpi-card total">
            <span className="kpi-title">Total Orders</span>
            <div className="kpi-main-value">{kpiData.total.count.toLocaleString()}</div>
            <div className="kpi-sub-stats">
              <div className="sub-stat-item">Units: <span>{kpiData.total.units.toLocaleString()}</span></div>
              <div className="sub-stat-item">Value: <span>{formatCurrency(kpiData.total.value)}</span></div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="kpi-card delivered">
            <span className="kpi-title">Delivered Orders</span>
            <div className="kpi-main-value">{kpiData.delivered.count.toLocaleString()}</div>
            <div className="kpi-sub-stats">
              <div className="sub-stat-item">Units: <span>{kpiData.delivered.units.toLocaleString()}</span></div>
              <div className="sub-stat-item">Value: <span>{formatCurrency(kpiData.delivered.value)}</span></div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="kpi-card pending">
            <span className="kpi-title">Pending Orders</span>
            <div className="kpi-main-value">{kpiData.pending.count.toLocaleString()}</div>
            <div className="kpi-sub-stats">
              <div className="sub-stat-item">Units: <span>{kpiData.pending.units.toLocaleString()}</span></div>
              <div className="sub-stat-item">Value: <span>{formatCurrency(kpiData.pending.value)}</span></div>
            </div>
          </div>

          {/* Cancelled Orders */}
          <div className="kpi-card cancelled">
            <span className="kpi-title">Cancelled Orders</span>
            <div className="kpi-main-value">{kpiData.cancelled.count.toLocaleString()}</div>
            <div className="kpi-sub-stats">
              <div className="sub-stat-item">Units: <span>{kpiData.cancelled.units.toLocaleString()}</span></div>
              <div className="sub-stat-item">Value: <span>{formatCurrency(kpiData.cancelled.value)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}