import React, { useState, useEffect } from 'react';
import { getSalesOrders } from '../services/api.js';

export default function TestApi() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20); 

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getSalesOrders({ page, pageSize })
      .then((res) => {
        if (isMounted) {
          // Based on API specification: returns { summary, data } or array depending on response structure
          setOrders(res.data || res);
          setSummary(res.summary || null);
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
  }, [page, pageSize]);

  return (
    <>
      <style>{`
        .test-api-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .api-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .api-header h2 {
          font-size: 1.4rem;
          color: #0f172a;
        }

        /* 2x2 Grid Container Layout */
        .grid-2x2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 768px) {
          .grid-2x2 {
            grid-template-columns: 1fr;
          }
        }

        /* Individual Card Container */
        .order-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .order-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sale-id {
          font-weight: 700;
          color: #1e293b;
          font-size: 1.05rem;
        }

        /* Status styling based on value */
        .status-badge {
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-delivered, .status-open {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .card-body-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.9rem;
          color: #475569;
          border-top: 1px solid #f1f5f9;
          padding-top: 10px;
        }

        .card-body-info span strong {
          color: #1e293b;
        }

        /* Loading and Error States */
        .state-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
          color: #64748b;
          font-size: 1rem;
        }

        .error-box {
          background: #fee2e2;
          border: 1px solid #f87171;
          color: #991b1b;
          padding: 20px;
          border-radius: 8px;
        }

        /* Pagination bar for test view */
        .test-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }

        .test-btn {
          padding: 8px 16px;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          color: #334155;
        }

        .test-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .test-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      <div className="test-api-container">
        <div className="api-header">
          <h2>Sales Orders API Integration Test (2x2 Grid View)</h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="state-box">
            Fetching <strong>"Sales Orders (Page {page})"</strong>... Please wait.
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-box">
            <strong>Error fetching data:</strong> {error}
          </div>
        )}

        {/* Data Display - 2x2 Grid */}
        {!loading && !error && (
          <>
            <div className="grid-2x2">
              {orders.map((order, idx) => {
                // Handling alternate property mappings depending on exact mock api schema keys
                const saleId = order.SalesId || order.salesId || order.id || `SO-${idx}`;
                const customerName = order.CustomerName || order.customerName || order.customer || 'Unknown Customer'; //
                const status = order.SalesStatus || order.status || order.siteStatus || 'Pending';
                const siteId = order.InventSiteId || order.site || order.branch || 'N/A';
                const amount = order.TotalAmount || order.amount || 0;

                const statusClass = status.toLowerCase().includes('pend') 
                  ? 'status-pending' 
                  : status.toLowerCase().includes('canc') 
                  ? 'status-cancelled' 
                  : 'status-delivered';

                return (
                  <div key={saleId} className="order-card">
                    <div className="card-top-row">
                      <span className="sale-id">{saleId}</span>
                      <span className={`status-badge ${statusClass}`}>{status}</span>
                    </div>

                    <div className="card-body-info">
                      <span>Customer Name: <strong>{customerName}</strong></span>
                      <span>Branch / Site: <strong>{siteId}</strong></span>
                      <span>Total Value: <strong>${Number(amount).toLocaleString()}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination for the test page view */}
            <div className="test-pagination">
              <button 
                className="test-btn" 
                onClick={() => setPage((p) => Math.max(p - 1, 1))} 
                disabled={page === 1}
              >
                Previous Page
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Current Page: {page}
              </span>
              <button 
                className="test-btn" 
                onClick={() => setPage((p) => p + 1)}
              >
                Next Page
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}