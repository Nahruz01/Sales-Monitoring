const BASE_URL = "https://hiring.harrisons.my/api/mock/sales-orders"
const ASSESSMENT_KEY = "hssb-assessment-mock-2026"

// Helper function to handle common headers
const getHeaders = () => ({
  "x-assessment-key": ASSESSMENT_KEY,
  "Accept": "application/json",
});

// 1. Fetch paginated orders, search, and filters
export async function getSalesOrders(params = {}) {
  const url = new URL(BASE_URL);
  
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== "") {
      url.searchParams.append(key, params[key]);
    }
  });

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// 2. Fetch a single order detail by ID
export async function getOrderDetails(salesId) {
  const response = await fetch(`${BASE_URL}/${salesId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch order ${salesId}`);
  }

  return await response.json();
}

// 3. Fetch metadata (statuses, sites) if needed
export async function getApiMeta() {
  const response = await fetch(`${BASE_URL}/meta`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch metadata");
  }

  return await response.json();
}