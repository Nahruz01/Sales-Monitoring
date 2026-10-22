import React, { useState, useEffect } from 'react';
import { getSalesOrders, getApiMeta } from '../services/api';

// Importing clean modern icons from lucide-react
import { 
  Layers, 
  FileText, 
  Truck, 
  Clock, 
  FileX 
} from 'lucide-react';

export default function SalesVisualization() {
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [branches, setBranches] = useState(['All']);

  // API data & loading states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpiData, setKpiData] = useState({
    totalCount: 0,
    totalValue: 0,
    totalInvoiced: 0,
    totalBalance: 0,
    deliveredCount: 0,
    deliveredTotal: 0,
    deliveredInvoiced: 0,
    deliveredBalance: 0,
    invoicedCount: 0,
    invoicedTotal: 0,
    invoicedInvoiced: 0,
    invoicedBalance: 0,
    pendingCount: 0,
    pendingTotal: 0,
    pendingInvoiced: 0,
    pendingBalance: 0,
    cancelledCount: 0,
    cancelledTotal: 0,
    cancelledInvoiced: 0,
    cancelledBalance: 0,
  });

  // 1. Fetch metadata facets once on mount to populate the branch dropdown
  useEffect(() => {
    getApiMeta()
      .then((meta) => {
        if (meta && meta.facets && meta.facets.sites) {
          const siteList = meta.facets.sites.map((s) => s.value);
          setBranches(['All', ...siteList]);
        }
      })
      .catch((err) => {
        console.warn('Could not load metadata facets, using fallback:', err);
      });
  }, []);

  // 2. Fetch all pages recursively and calculate metrics with applied filters
  const fetchAllOrdersAndCalculate = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseParams = { pageSize: 100 };

        // Pass branch/site parameter to the API if selected
        if (selectedBranch && selectedBranch !== 'All') {
          baseParams.site = selectedBranch.trim();
        }

        // a. Fetch page 1 first to know total pages
        const firstPageRes = await getSalesOrders({ ...baseParams, page: 1 });
        let allItems = firstPageRes.data || [];
        const totalPages = firstPageRes.totalPages || 1;

        // b. Fetch the rest of the pages in parallel if needed
        if (totalPages > 1) {
          const pagePromises = [];
          for (let p = 2; p <= totalPages; p++) {
            pagePromises.push(getSalesOrders({ ...baseParams, page: p }));
          }

          const remainingResponses = await Promise.all(pagePromises);
          remainingResponses.forEach((res) => {
            if (res.data) {
              allItems = allItems.concat(res.data);
            }
          });
        }

        // c. Apply Client-Side Timeline Filtering (if dates are provided)
        let filteredItems = allItems;
        if (startDate || endDate) {
          filteredItems = allItems.filter((item) => {
            // Use ShippingDateRequested (or CreatedDateTime1 depending on your preference)
            const orderDateStr = item.ShippingDateRequested || item.CreatedDateTime1;
            if (!orderDateStr) return false;

            const orderDate = new Date(orderDateStr.split('T')[0]); // Normalize to YYYY-MM-DD
            
            if (startDate && orderDate < new Date(startDate)) return false;
            if (endDate && orderDate > new Date(endDate)) return false;
            
            return true;
          });
        }

        // d. Perform calculations on the fully filtered dataset
        let totalValue = 0;
        let totalInvoiced = 0;
        let totalBalance = 0;

        let deliveredCount = 0;
        let deliveredTotal = 0;
        let deliveredInvoiced = 0;
        let deliveredBalance = 0;
        
        let invoicedCount = 0;
        let invoicedTotal = 0;
        let invoicedInvoiced = 0;
        let invoicedBalance = 0;

        let pendingCount = 0;
        let pendingTotal = 0;
        let pendingInvoiced = 0;
        let pendingBalance = 0;

        let cancelledCount = 0;
        let cancelledTotal = 0;
        let cancelledInvoiced = 0;
        let cancelledBalance = 0;

        filteredItems.forEach((item) => {
          const status = (item.DOT_ShowOrderStatus || item.SalesStatus || '').toLowerCase();
          const totalAmount = item.HAR_TotalSOAmount || 0;
          const invoicedAmount = item.HAR_InvoicedAmount || 0;
          const balanceAmount = item.HAR_BalanceAmount || 0;

          totalValue += totalAmount;
          totalInvoiced += invoicedAmount;
          totalBalance += balanceAmount;

          if (status.includes('delivered')) {
            deliveredCount += 1;
            deliveredTotal += totalAmount;
            deliveredInvoiced += invoicedAmount;
            deliveredBalance += balanceAmount;
          } else if (status.includes('invoiced')) {
            invoicedCount += 1;
            invoicedTotal += totalAmount;
            invoicedInvoiced += invoicedAmount;
            invoicedBalance += balanceAmount;
          } else if (status.includes('cancelled')) {
            cancelledCount += 1;
            cancelledTotal += totalAmount;
            cancelledInvoiced += invoicedAmount;
            cancelledBalance += balanceAmount;
          } else {
            pendingCount += 1;
            pendingTotal += totalAmount;
            pendingInvoiced += invoicedAmount;
            pendingBalance += balanceAmount;
          }
        });

        setKpiData({
          totalCount: filteredItems.length,
          totalValue,
          totalInvoiced,
          totalBalance,
          deliveredCount,
          deliveredTotal,
          deliveredInvoiced,
          deliveredBalance,
          invoicedCount,
          invoicedTotal,
          invoicedInvoiced,
          invoicedBalance,
          pendingCount,
          pendingTotal,
          pendingInvoiced,
          pendingBalance,
          cancelledCount,
          cancelledTotal,
          cancelledInvoiced,
          cancelledBalance,
        });

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

  // Initial load
  useEffect(() => {
    fetchAllOrdersAndCalculate();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 2 }).format(amount || 0);
  };

  // Helper component for progress bar & balance
  const renderProgressBar = (total, invoiced, balance) => {
    const percentage = total > 0 ? Math.min(Math.max((invoiced / total) * 100, 0), 100) : 0;

    return (
      <div className="progress-section">
        <div className="progress-labels">
          <span>Invoiced: <strong>{formatCurrency(invoiced)}</strong></span>
          <span>Total: <strong>{formatCurrency(total)}</strong></span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="balance-row">
          <span>Balance Amount:</span>
          <strong>{formatCurrency(balance)}</strong>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .sales-container { display: flex; flex-direction: column; gap: 24px; }
        .filter-bar { background: #ffffff; padding: 16px 20px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); }
        .filter-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .filter-label { font-weight: 600; font-size: 0.9rem; color: #475569; }
        .date-input, .select-input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; color: #1e293b; outline: none; background-color: #f8fafc; }
        .date-input:focus, .select-input:focus { border-color: #3b82f6; background-color: #fff; }
        .filter-separator { color: #64748b; font-weight: 500; }
        .filter-btn { background-color: #2563eb; color: white; border: none; padding: 9px 16px; border-radius: 6px; font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: background-color 0.2s; }
        .filter-btn:hover { background-color: #1d4ed8; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .kpi-card { background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); display: flex; flex-direction: column; gap: 12px; position: relative; overflow: hidden; }
        .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; }
        .kpi-card.total::before { background-color: #3b82f6; }
        .kpi-card.invoiced::before { background-color: #10b981; }
        .kpi-card.delivered::before { background-color: #06b6d4; }
        .kpi-card.pending::before { background-color: #f59e0b; }
        .kpi-card.cancelled::before { background-color: #ef4444; }
        
        .kpi-header-row { display: flex; align-items: center; justify-content: space-between; }
        .kpi-title { font-size: 0.9rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 8px; }
        .kpi-title svg { color: #64748b; }
        .kpi-main-value { font-size: 1.8rem; font-weight: 700; color: #0f172a; }
        
        /* Progress Bar Styles */
        .progress-section { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid #f1f5f9; padding-top: 10px; margin-top: auto; }
        .progress-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; }
        .progress-labels strong { color: #0f172a; }
        .progress-track { width: 100%; height: 8px; background-color: #e2e8f0; border-radius: 9999px; overflow: hidden; display: flex; }
        .progress-fill { height: 100%; background-color: #10b981; transition: width 0.3s ease; }
        .balance-row { display: flex; justify-content: space-between; font-size: 0.85rem; color: #334155; margin-top: 2px; }
        .balance-row strong { color: #0f172a; }

        .state-banner { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 6px; font-size: 0.9rem; color: #475569; text-align: center; }
        .error-banner { background: #fee2e2; border: 1px solid #f87171; color: #991b1b; padding: 12px 16px; border-radius: 6px; font-size: 0.9rem; }
      `}</style>

      <div className="sales-container">
        {/* Combined Filter Bar: Branch + Timeline */}
        <div className="filter-bar">
          <div className="filter-group">
            <span className="filter-label">Branch:</span>
            <select 
              className="select-input"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              {branches.map((branch, idx) => (
                <option key={idx} value={branch}>
                  {branch === 'All' ? 'All Branches' : branch}
                </option>
              ))}
            </select>

            <span className="filter-label" style={{ marginLeft: '12px' }}>Timeline:</span>
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
          
          <button className="filter-btn" onClick={fetchAllOrdersAndCalculate}>
            {loading ? 'Filtering...' : 'Apply Filters'}
          </button>
        </div>

        {error && <div className="error-banner">Error loading analytics: {error}</div>}
        {loading && <div className="state-banner">Applying filters and calculating performance metrics...</div>}

        {!loading && !error && (
          <div className="kpi-grid">
            {/* 1. Total Card */}
            <div className="kpi-card total">
              <div className="kpi-header-row">
                <span className="kpi-title">
                  <Layers size={18} /> Total
                </span>
              </div>
              <div className="kpi-main-value">{kpiData.totalCount.toLocaleString()} Orders</div>
              {renderProgressBar(kpiData.totalValue, kpiData.totalInvoiced, kpiData.totalBalance)}
            </div>

            {/* 2. Invoiced Card */}
            <div className="kpi-card invoiced">
              <div className="kpi-header-row">
                <span className="kpi-title">
                  <FileText size={18} /> Invoiced
                </span>
              </div>
              <div className="kpi-main-value">{kpiData.invoicedCount.toLocaleString()} Orders</div>
              {renderProgressBar(kpiData.invoicedTotal, kpiData.invoicedInvoiced, kpiData.invoicedBalance)}
            </div>

            {/* 3. Delivered Card */}
            <div className="kpi-card delivered">
              <div className="kpi-header-row">
                <span className="kpi-title">
                  <Truck size={18} /> Delivered
                </span>
              </div>
              <div className="kpi-main-value">{kpiData.deliveredCount.toLocaleString()} Orders</div>
              {renderProgressBar(kpiData.deliveredTotal, kpiData.deliveredInvoiced, kpiData.deliveredBalance)}
            </div>

            {/* 4. Pending Card */}
            <div className="kpi-card pending">
              <div className="kpi-header-row">
                <span className="kpi-title">
                  <Clock size={18} /> Pending
                </span>
              </div>
              <div className="kpi-main-value">{kpiData.pendingCount.toLocaleString()} Orders</div>
              {renderProgressBar(kpiData.pendingTotal, kpiData.pendingInvoiced, kpiData.pendingBalance)}
            </div>

            {/* 5. Cancelled Card */}
            <div className="kpi-card cancelled">
              <div className="kpi-header-row">
                <span className="kpi-title">
                  <FileX size={18} /> Cancelled
                </span>
              </div>
              <div className="kpi-main-value">{kpiData.cancelledCount.toLocaleString()} Orders</div>
              {renderProgressBar(kpiData.cancelledTotal, kpiData.cancelledInvoiced, kpiData.cancelledBalance)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}