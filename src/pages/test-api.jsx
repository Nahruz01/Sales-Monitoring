import React, { useState, useEffect } from 'react';
import { getSalesOrders } from '../services/api.js';

export default function TestApi() {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(4); // 4 items per page fits the 2x2 grid view perfectly

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getSalesOrders({ page, pageSize })
      .then((res) => {
        if (isMounted) {
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
          flex-direction: column;
          gap: 8px;
        }

        .api-header h2 {
          font-size: 1.4rem;
          color: #0f172a;
          margin: 0;
        }

        .summary-bar {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 0.85rem;
          color: #334155;
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* 2x2 Grid Layout */
        .grid-2x2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        @media (max-width: 900px) {
          .grid-2x2 {
            grid-template-columns: 1fr;
          }
        }

        /* Card Container */
        .order-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f1f5f9;
          padding-bottom: 10px;
        }

        .sale-id {
          font-weight: 700;
          color: #0f172a;
          font-size: 1.1rem;
        }

        /* Status Styling */
        .status-badge {
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-open { background-color: #dbeafe; color: #1e40af; }
        .status-invoiced { background-color: #d1fae5; color: #065f46; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-delivered { background-color: #e0e7ff; color: #3730a3; }

        /* Schema Field Groups */
        .attr-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: #f8fafc;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #f1f5f9;
        }

        .group-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-bottom: 4px;
        }

        .attr-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #475569;
          gap: 8px;
        }

        .attr-row span.val {
          font-weight: 600;
          color: #0f172a;
          text-align: right;
          word-break: break-all;
        }

        /* States & Buttons */
        .state-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 40px;
          border-radius: 8px;
          text-align: center;
          color: #64748b;
        }

        .error-box {
          background: #fee2e2;
          border: 1px solid #f87171;
          color: #991b1b;
          padding: 20px;
          border-radius: 8px;
        }

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
          <h2>Sales Orders API Schema Test (All Attributes)</h2>
          
          {summary && (
            <div className="summary-bar">
              <span><strong>Total Orders:</strong> {summary.total_orders}</span>
              <span><strong>Open:</strong> {summary.open_orders}</span>
              <span><strong>Invoiced:</strong> {summary.invoiced_orders}</span>
              <span><strong>Delivered:</strong> {summary.delivered_orders}</span>
              <span><strong>Cancelled:</strong> {summary.cancelled_orders}</span>
              <span><strong>Total Value:</strong> RM {summary.total_order_value?.toLocaleString()}</span>
            </div>
          )}
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

        {/* 2x2 Grid Display showing ALL schema attributes */}
        {!loading && !error && (
          <>
            <div className="grid-2x2">
              {orders.map((order) => {
                const status = order.DOT_ShowOrderStatus || order.SalesStatus || 'Open order';
                const statusClass = status.toLowerCase().includes('open')
                  ? 'status-open'
                  : status.toLowerCase().includes('inv')
                  ? 'status-invoiced'
                  : status.toLowerCase().includes('canc')
                  ? 'status-cancelled'
                  : 'status-delivered';

                return (
                  <div key={order.SalesId} className="order-card">
                    {/* Header */}
                    <div className="card-top-row">
                      <span className="sale-id">{order.SalesId}</span>
                      <span className={`status-badge ${statusClass}`}>{status}</span>
                    </div>

                    {/* Group 1: General & Customer Info */}
                    <div className="attr-group">
                      <div className="group-title">1. General & Customer</div>
                      <div className="attr-row"><span>SalesName:</span><span className="val">{order.SalesName}</span></div>
                      <div className="attr-row"><span>CustAccount:</span><span className="val">{order.CustAccount}</span></div>
                      <div className="attr-row"><span>SalesTaker:</span><span className="val">{order.SalesTaker}</span></div>
                      <div className="attr-row"><span>CustomerRef:</span><span className="val">{order.CustomerRef}</span></div>
                      <div className="attr-row"><span>SalesType:</span><span className="val">{order.SalesType}</span></div>
                      <div className="attr-row"><span>PurchOrderFormNum:</span><span className="val">{order.PurchOrderFormNum}</span></div>
                    </div>

                    {/* Group 2: Organization & Grouping */}
                    <div className="attr-group">
                      <div className="group-title">2. Site & Classification</div>
                      <div className="attr-row"><span>InventSiteId:</span><span className="val">{order.InventSiteId}</span></div>
                      <div className="attr-row"><span>DOT_ItemGroupId:</span><span className="val">{order.DOT_ItemGroupId}</span></div>
                      <div className="attr-row"><span>SalesGroup:</span><span className="val">{order.SalesGroup}</span></div>
                    </div>

                    {/* Group 3: Financial Amounts */}
                    <div className="attr-group">
                      <div className="group-title">3. Financial Breakdown</div>
                      <div className="attr-row"><span>HAR_TotalSOAmount:</span><span className="val">RM {order.HAR_TotalSOAmount?.toFixed(2)}</span></div>
                      <div className="attr-row"><span>HAR_InvoicedAmount:</span><span className="val">RM {order.HAR_InvoicedAmount?.toFixed(2)}</span></div>
                      <div className="attr-row"><span>HAR_BalanceAmount:</span><span className="val">RM {order.HAR_BalanceAmount?.toFixed(2)}</span></div>
                    </div>

                    {/* Group 4: Statuses */}
                    <div className="attr-group">
                      <div className="group-title">4. Document & Status Flags</div>
                      <div className="attr-row"><span>SalesStatus:</span><span className="val">{order.SalesStatus}</span></div>
                      <div className="attr-row"><span>DocumentStatus:</span><span className="val">{order.DocumentStatus}</span></div>
                      <div className="attr-row"><span>DOT_ValidationStatus:</span><span className="val">{order.DOT_ValidationStatus}</span></div>
                      <div className="attr-row"><span>ReleaseStatus:</span><span className="val">{order.ReleaseStatus}</span></div>
                      <div className="attr-row"><span>MCROrderStopped:</span><span className="val">{order.MCROrderStopped}</span></div>
                    </div>

                    {/* Group 5: District & Delivery */}
                    <div className="attr-group">
                      <div className="group-title">5. Location & Delivery</div>
                      <div className="attr-row"><span>SalesDistrictDescription:</span><span className="val">{order.SalesDistrictDescription}</span></div>
                      <div className="attr-row"><span>HAR_SalesDeliveryDistrictId:</span><span className="val">{order.HAR_SalesDeliveryDistrictId}</span></div>
                      <div className="attr-row"><span>HAR_DeliveryDistrictDescription:</span><span className="val">{order.HAR_DeliveryDistrictDescription}</span></div>
                    </div>

                    {/* Group 6: Dates & Notes */}
                    <div className="attr-group">
                      <div className="group-title">6. Dates & Notes</div>
                      <div className="attr-row"><span>ShippingDateRequested:</span><span className="val">{order.ShippingDateRequested}</span></div>
                      <div className="attr-row"><span>CreatedDateTime1:</span><span className="val">{order.CreatedDateTime1}</span></div>
                      <div className="attr-row"><span>ModifiedDateTime1:</span><span className="val">{order.ModifiedDateTime1}</span></div>
                      <div className="attr-row"><span>DOT_SONotes:</span><span className="val">{order.DOT_SONotes || 'null'}</span></div>
                      <div className="attr-row"><span>DOT_SFANotes:</span><span className="val">{order.DOT_SFANotes || 'null'}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="test-pagination">
              <button 
                className="test-btn" 
                onClick={() => setPage((p) => Math.max(p - 1, 1))} 
                disabled={page === 1}
              >
                Previous Page
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                Page {page} of {summary ? summary.totalPages : '?'}
              </span>
              <button 
                className="test-btn" 
                onClick={() => setPage((p) => p + 1)}
                disabled={summary && page >= summary.totalPages}
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