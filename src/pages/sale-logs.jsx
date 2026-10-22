import React, { useState, useEffect } from 'react';
import { getSalesOrders } from '../services/api'; // Ensure this matches your file path to api.js

export default function SalesLogbook() {
  // Server-side and filter states
  const [salesData, setSalesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Default to 25 items per page (max 100)

  // Dropdown options matching API requirements
  const branches = ['All', 'B10', 'B20', 'B30', 'B40']; // Adjust based on your meta endpoint if needed
  const statuses = ['All', 'Open order', 'Delivered', 'Cancelled', 'Pending'];

  // Fetch data from API whenever filters, page, or page size change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Map component states to API query parameters
    const params = {
      page: currentPage,
      pageSize: itemsPerPage,
    };

    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedBranch !== 'All') params.site = selectedBranch;
    if (selectedStatus !== 'All') params.status = selectedStatus;
    // Optional timeline filters if API supports them, otherwise handled client-side or omitted if backend ignores
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    getSalesOrders(params)
      .then((res) => {
        if (isMounted) {
          // Handles structure: { data: [...], total: number } or direct array depending on exact server schema
          const items = res.data || res.items || (Array.isArray(res) ? res : []);
          setSalesData(items);
          setTotalCount(res.total || items.length);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, itemsPerPage, searchQuery, selectedBranch, selectedStatus, startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
  };

  // Reset to page 1 on filter modifications
  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Calculate total pages safely (capped at 100 max pages view standard)
  const calculatedTotalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const totalPages = Math.min(calculatedTotalPages, 100);

  return (
    <>
      <style>{`
        .logbook-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .logbook-filters {
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        }

        .filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .filter-field label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
        }

        .filter-field input, .filter-field select {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #1e293b;
          background-color: #f8fafc;
          outline: none;
          transition: border-color 0.2s;
        }

        .filter-field input:focus, .filter-field select:focus {
          border-color: #3b82f6;
          background-color: #fff;
        }

        .date-range-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .date-range-group input {
          width: 100%;
        }

        .table-card {
          background: #ffffff;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
          overflow: hidden;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.9rem;
        }

        th {
          background-color: #f8fafc;
          color: #475569;
          font-weight: 600;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }

        td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          color: #1e293b;
        }

        tr:hover td {
          background-color: #f8fafc;
        }

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.delivered, .badge.open { background-color: #d1fae5; color: #065f46; }
        .badge.pending { background-color: #fef3c7; color: #92400e; }
        .badge.cancelled { background-color: #fee2e2; color: #991b1b; }

        .details-btn {
          background-color: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .details-btn:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }

        .state-row {
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-style: italic;
        }

        .error-row {
          background-color: #fee2e2;
          color: #991b1b;
          padding: 20px;
          text-align: center;
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background-color: #ffffff;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .pagination-info {
          font-size: 0.85rem;
          color: #64748b;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .page-btn {
          padding: 6px 12px;
          border: 1px solid #cbd5e1;
          background-color: #ffffff;
          color: #334155;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .page-btn:hover:not(:disabled) {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .per-page-select {
          padding: 5px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.85rem;
          outline: none;
          background-color: #f8fafc;
        }
      `}</style>

      <div className="logbook-container">
        {/* Filters Section */}
        <div className="logbook-filters">
          <div className="filter-field">
            <label>Search (Sales ID / Customer)</label>
            <input 
              type="text" 
              placeholder="e.g. SO-MOCK or Siti" 
              value={searchQuery}
              onChange={handleFilterChange(setSearchQuery)}
            />
          </div>

          <div className="filter-field">
            <label>Branch / Site</label>
            <select value={selectedBranch} onChange={handleFilterChange(setSelectedBranch)}>
              {branches.map((branch, index) => (
                <option key={index} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Order Status</label>
            <select value={selectedStatus} onChange={handleFilterChange(setSelectedStatus)}>
              {statuses.map((status, index) => (
                <option key={index} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Timeline (Date to Date)</label>
            <div className="date-range-group">
              <input type="date" value={startDate} onChange={handleFilterChange(setStartDate)} />
              <span>to</span>
              <input type="date" value={endDate} onChange={handleFilterChange(setEndDate)} />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-card">
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Sales ID</th>
                  <th>Customer</th>
                  <th>Branch / Site</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="state-row">Fetching sales orders from API...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="error-row">Error loading data: {error}</td>
                  </tr>
                ) : salesData.length > 0 ? (
                  salesData.map((row, idx) => {
                    const saleId = row.SalesId || row.salesId || row.id || `SO-${idx}`;
                    const customer = row.CustomerName || row.customerName || row.customer || 'N/A';
                    const branch = row.InventSiteId || row.site || row.branch || 'N/A';
                    const date = row.OrderDate || row.date || 'N/A';
                    const status = row.SalesStatus || row.status || 'Pending';
                    const amount = row.TotalAmount || row.amount || 0;

                    return (
                      <tr key={saleId}>
                        <td><strong>{saleId}</strong></td>
                        <td>{customer}</td>
                        <td>{branch}</td>
                        <td>{date}</td>
                        <td>
                          <span className={`badge ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {status}
                          </span>
                        </td>
                        <td>{formatCurrency(amount)}</td>
                        <td>
                          <button 
                            className="details-btn"
                            onClick={() => alert(`Viewing details for invoice: ${saleId}`)}
                          >
                            See Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="state-row">
                      No matching sales records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div className="pagination-bar">
            <div className="pagination-info">
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Max 100 pages view)
            </div>

            <div className="pagination-controls">
              <label htmlFor="per-page" style={{ fontSize: '0.85rem', color: '#64748b' }}>Per view:</label>
              <select 
                id="per-page" 
                className="per-page-select" 
                value={itemsPerPage} 
                onChange={handleItemsPerPageChange}
              >
                <option value={10}>10</option>
                <option value={25}>25 (Default)</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1 || loading}
              >
                « First
              </button>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1 || loading}
              >
                ‹ Prev
              </button>
              
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 6px' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button 
                className="page-btn" 
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages || loading}
              >
                Next ›
              </button>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages || loading}
              >
                Last »
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}