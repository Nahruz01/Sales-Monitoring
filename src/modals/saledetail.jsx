import React, { useState, useEffect } from 'react';
import { getOrderDetails } from '../services/api';

export default function SaleDetailModal({ salesId, isOpen, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !salesId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getOrderDetails(salesId)
      .then((data) => {
        if (isMounted) {
          // Some APIs wrap the single record in a data property or return it directly
          setOrder(data.data || data);
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
  }, [isOpen, salesId]);

  if (!isOpen) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 2 }).format(amount || 0);
  };

  const status = order ? (order.DOT_ShowOrderStatus || order.SalesStatus || 'Open order') : '';
  const statusClass = status.toLowerCase().includes('open')
    ? 'badge open-order'
    : status.toLowerCase().includes('inv')
    ? 'badge invoiced'
    : status.toLowerCase().includes('canc')
    ? 'badge cancelled'
    : 'badge delivered';

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(2px);
        }

        .modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: modalScaleIn 0.2s ease-out;
        }

        @keyframes modalScaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }

        .modal-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .modal-close-btn {
          background: transparent;
          border: none;
          font-size: 1.25rem;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .modal-close-btn:hover {
          background-color: #e2e8f0;
          color: #0f172a;
        }

        .modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .order-card-inner {
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

        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge.delivered  { background-color: #d1fae5; color: #065f46; }
        .badge.open-order { background-color: #fef3c7; color: #92400e; }
        .badge.cancelled { background-color: #fee2e2; color: #991b1b; }
        .badge.invoiced { background-color: #dbeafe; color: #1e40af; }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Sales Order Details: {salesId}</h3>
            <button className="modal-close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                Fetching <code>GET /api/mock/sales-orders/{salesId}</code>...
              </div>
            ) : error ? (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '6px' }}>
                Error: {error}
              </div>
            ) : order ? (
              <div className="order-card-inner">
                <div className="card-top-row">
                  <span className="sale-id">{order.SalesId || salesId}</span>
                  <span className={statusClass}>{status}</span>
                </div>

                {/* Group 1: General & Customer */}
                <div className="attr-group">
                  <div className="group-title">1. General & Customer</div>
                  <div className="attr-row"><span>SalesName:</span><span className="val">{order.SalesName || 'N/A'}</span></div>
                  <div className="attr-row"><span>CustAccount:</span><span className="val">{order.CustAccount || 'N/A'}</span></div>
                  <div className="attr-row"><span>SalesTaker:</span><span className="val">{order.SalesTaker || 'N/A'}</span></div>
                  <div className="attr-row"><span>CustomerRef:</span><span className="val">{order.CustomerRef || 'N/A'}</span></div>
                  <div className="attr-row"><span>SalesType:</span><span className="val">{order.SalesType || 'N/A'}</span></div>
                  <div className="attr-row"><span>PurchOrderFormNum:</span><span className="val">{order.PurchOrderFormNum || 'N/A'}</span></div>
                </div>

                {/* Group 2: Site & Classification */}
                <div className="attr-group">
                  <div className="group-title">2. Site & Classification</div>
                  <div className="attr-row"><span>InventSiteId:</span><span className="val">{order.InventSiteId || 'N/A'}</span></div>
                  <div className="attr-row"><span>DOT_ItemGroupId:</span><span className="val">{order.DOT_ItemGroupId || 'N/A'}</span></div>
                  <div className="attr-row"><span>SalesGroup:</span><span className="val">{order.SalesGroup || 'N/A'}</span></div>
                </div>

                {/* Group 3: Financial Breakdown */}
                <div className="attr-group">
                  <div className="group-title">3. Financial Breakdown</div>
                  <div className="attr-row"><span>HAR_TotalSOAmount:</span><span className="val">{formatCurrency(order.HAR_TotalSOAmount)}</span></div>
                  <div className="attr-row"><span>HAR_InvoicedAmount:</span><span className="val">{formatCurrency(order.HAR_InvoicedAmount)}</span></div>
                  <div className="attr-row"><span>HAR_BalanceAmount:</span><span className="val">{formatCurrency(order.HAR_BalanceAmount)}</span></div>
                </div>

                {/* Group 4: Document & Status Flags */}
                <div className="attr-group">
                  <div className="group-title">4. Document & Status Flags</div>
                  <div className="attr-row"><span>SalesStatus:</span><span className="val">{order.SalesStatus || 'N/A'}</span></div>
                  <div className="attr-row"><span>DocumentStatus:</span><span className="val">{order.DocumentStatus || 'N/A'}</span></div>
                  <div className="attr-row"><span>DOT_ValidationStatus:</span><span className="val">{order.DOT_ValidationStatus || 'N/A'}</span></div>
                  <div className="attr-row"><span>ReleaseStatus:</span><span className="val">{order.ReleaseStatus || 'N/A'}</span></div>
                  <div className="attr-row"><span>MCROrderStopped:</span><span className="val">{order.MCROrderStopped || 'N/A'}</span></div>
                </div>

                {/* Group 5: Location & Delivery */}
                <div className="attr-group">
                  <div className="group-title">5. Location & Delivery</div>
                  <div className="attr-row"><span>SalesDistrictDescription:</span><span className="val">{order.SalesDistrictDescription || 'N/A'}</span></div>
                  <div className="attr-row"><span>HAR_SalesDeliveryDistrictId:</span><span className="val">{order.HAR_SalesDeliveryDistrictId || 'N/A'}</span></div>
                  <div className="attr-row"><span>HAR_DeliveryDistrictDescription:</span><span className="val">{order.HAR_DeliveryDistrictDescription || order.DeliveryDistrictDescription || 'N/A'}</span></div>
                </div>

                {/* Group 6: Dates & Notes */}
                <div className="attr-group">
                  <div className="group-title">6. Dates & Notes</div>
                  <div className="attr-row"><span>ShippingDateRequested:</span><span className="val">{order.ShippingDateRequested || 'N/A'}</span></div>
                  <div className="attr-row"><span>CreatedDateTime1:</span><span className="val">{order.CreatedDateTime1 || 'N/A'}</span></div>
                  <div className="attr-row"><span>ModifiedDateTime1:</span><span className="val">{order.ModifiedDateTime1 || 'N/A'}</span></div>
                  <div className="attr-row"><span>DOT_SONotes:</span><span className="val">{order.DOT_SONotes || 'null'}</span></div>
                  <div className="attr-row"><span>DOT_SFANotes:</span><span className="val">{order.DOT_SFANotes || 'null'}</span></div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No data found for this order.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}