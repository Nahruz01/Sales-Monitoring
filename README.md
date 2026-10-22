# HSSB Sales Analytics & Monitoring Dashboard

A high-performance React-based sales analytics dashboard featuring integrated KPI cards, multi-parameter filtering (timeline, site/branch, and status), server-side synchronized data visualization, and an interactive sales logbook with full-schema modal inspection.

**Live Public URL: https://sales-monitoring-delta.vercel.app/**

---

## 🚀 Features

- **Dynamic KPI Cards with Progress Bars**: Visualizes total sales volume, invoiced amounts, and remaining balance amounts (`HAR_BalanceAmount`) broken down across order statuses (Delivered, Invoiced, Pending, Cancelled).
- **Multi-Page Recursive Data Fetcher**: Bypasses backend pagination limits (`pageSize: 100`) to compute accurate full-dataset global sums and analytics.
- **Advanced Filtering**: Filter records dynamically by **Timeline (Start/End Date)**, **Branch/Site** (fetched dynamically from `/meta`), and **Order Status**.
- **Interactive Sales Logbook & Modal Detail Viewer**: Paginated table view with search functionality and a detailed inspector modal that fetches single-order records via `GET /sales-orders/{salesId}`

---

## 🛠️ Tech Stack

- **React** (Hooks: `useState`, `useEffect`)
- **Lucide React** (Modern UI iconography)
- **CSS-in-JS** (Responsive, standalone style tags)
- **Fetch API** (Async communication with the HSSB Assessment Backend)

---

## 📦 Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Nahruz01/Sales-Monitoring.git
   cd Sales-Monitoring
