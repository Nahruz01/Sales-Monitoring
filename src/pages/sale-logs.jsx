import React, { useState, useEffect } from 'react';
import { getSalesOrders } from '../services/api';
import SaleDetailModal from '../modals/saledetail';

export default function SalesLogbook() {
  const [salesData, setSalesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSaleId, setActiveSaleId] = useState(null);

  // Filter inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [branches, setBranches] = useState(['All', 'A10', 'B20', 'C30', 'D40', 'E50', 'KK01', 'SDK02', 'TWU03']);
  const [statuses, setStatuses] = useState(['All', 'Open order', 'Delivered', 'Cancelled', 'Invoiced']);

  useEffect(() => {
    getSalesOrders({ pageSize: 1200 })
      .then((res) => {
        const items = res.data || [];
        if (items.length > 0) {
          const uniqueSites = ['All', ...new Set(items.map(item => item.InventSiteId).filter(Boolean))];
          const uniqueStatuses = ['All', ...new Set(items.map(item => item.DOT_ShowOrderStatus || item.SalesStatus).filter(Boolean))];
          
          setBranches(uniqueSites.sort());
          setStatuses(uniqueStatuses.sort());
        }
      })
      .catch((err) => console.warn('Could not load filter metadata', err));
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      pageSize: itemsPerPage,
    };

    if (searchQuery.trim()) params.q = searchQuery.trim();
    if (selectedBranch !== 'All') params.site = selectedBranch;
    if (selectedStatus !== 'All') params.status = selectedStatus;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    getSalesOrders(params)
      .then((res) => {
        if (isMounted) {
          const items = res.data || [];
          setSalesData(items);
          setTotalCount(res.total || items.length);
          setTotalPages(res.totalPages || Math.ceil((res.total || items.length) / itemsPerPage) || 1);
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

  const handleOpenModal = (saleId) => {
    setActiveSaleId(saleId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveSaleId(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 2 }).format(amount || 0);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        .logbook-container { display: flex; flex-direction: column; gap: 20px; }
        .logbook-filters { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); }
        .filter-field { display: flex; flex-direction: column; gap: 6px; }
        .filter-field label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .filter-field input, .filter-field select { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; color: #1e293b; background-color: #f8fafc; outline: none; transition: border-color 0.2s; }
        .filter-field input:focus, .filter-field select:focus { border-color: #3b82f6; background-color: #fff; }
        .date-range-group { display: flex; align-items: center; gap: 6px; }
        .date-range-group input { width: 100%; }
        .table-card { background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); overflow: hidden; }
        .table-responsive { width: 100%; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
        th { background-color: #f8fafc; color: #475569; font-weight: 600; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
        td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
        tr:hover td { background-color: #f8fafc; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .badge.delivered { background-color: #d1fae5; color: #065f46; }
        .badge.open-order { background-color: #fef3c7; color: #92400e; }
        .badge.cancelled { background-color: #fee2e2; color: #991b1b; }
        .badge.invoiced { background-color: #dbeafe; color: #1e40af; }
        .details-btn { background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .details-btn:hover { background-color: #e2e8f0; color: #0f172a; }
        .state-row { padding: 40px; text-align: center; color: #64748b; font-style: italic; }
        .error-row { background-color: #fee2e2; color: #991b1b; padding: 20px; text-align: center; }
        .pagination-bar { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background-color: #ffffff; border-top: 1px solid #e2e8f0; flex-wrap: wrap; gap: 12px; }
        .pagination-info { font-size: 0.85rem; color: #64748b; }
        .pagination-controls { display: flex; align-items: center; gap: 8px; }
        .page-btn { padding: 6px 12px; border: 1px solid #cbd5e1; background-color: #ffffff; color: #334155; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; }
        .page-btn:hover:not(:disabled) { background-color: #f1f5f9; color: #0f172a; }
        .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .per-page-select { padding: 5px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; outline: none; background-color: #f8fafc; }
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
            <label>Timeline (Shipping Date)</label>
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
                  <th>Customer Name</th>
                  <th>Branch / Site</th>
                  <th>Shipping Date</th>
                  <th>Status</th>
                  <th>Total Amount</th>
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
                    const saleId = row.SalesId || `SO-${idx}`;
                    const customer = row.SalesName || 'N/A';
                    const branch = row.InventSiteId || 'N/A';
                    const site = row.SalesDistrictDescription || 'N/A';
                    const date = row.ShippingDateRequested || 'N/A';
                    const status = row.DOT_ShowOrderStatus || row.SalesStatus || 'Pending';
                    const amount = row.HAR_TotalSOAmount || 0;

                    return (
                      <tr key={saleId}>
                        <td><strong>{saleId}</strong></td>
                        <td>{customer}</td>
                        <td>{branch} - {site}</td>
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
                            onClick={() => handleOpenModal(saleId)}
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
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (Total: {totalCount} records)
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
                <option value={25}>25</option>
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

      {/* Reusable Modal Component */}
      <SaleDetailModal 
        salesId={activeSaleId} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}