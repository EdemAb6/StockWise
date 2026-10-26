const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    const error = new Error(body?.error || "Something went wrong");
    error.status = response.status;
    error.details = body?.details;
    throw error;
  }

  return body;
}

export function getDashboardStats() {
  return apiRequest("/dashboard/stats");
}

function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export function getProducts(params = {}) {
  return apiRequest(`/products${buildQueryString(params)}`);
}

export function getProductById(id) {
  return apiRequest(`/products/${id}`);
}

export function createProduct(productData) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
}

export function updateProduct(id, productData) {
  return apiRequest(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productData),
  });
}

export function deleteProduct(id) {
  return apiRequest(`/products/${id}`, {
    method: "DELETE",
  });
}
