const BASE_URL = "https://vehicleservicemanagement-fndp.onrender.com";

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function clearAuthToken() {
  authToken = null;
}

async function request(path, options = {}) {
  const headers = {
    accept: "*/*",
    "Content-Type": "application/json",
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok || payload?.success === false) {
    const message = payload?.message || payload?.errors?.[0] || "Request failed. Please try again.";
    throw new Error(message);
  }

  return payload;
}

export const authApi = {
  sendOtp: mobileNumber =>
    request("/api/auth/send-otp", {
      method: "POST",
      body: { mobileNumber }
    }),
  verifyOtp: (mobileNumber, otp) =>
    request("/api/auth/verify-otp", {
      method: "POST",
      body: { mobileNumber, otp }
    }),
  registerCustomer: body =>
    request("/api/auth/register-customer", {
      method: "POST",
      body
    }),
  registerPartner: body =>
    request("/api/auth/register-partner", {
      method: "POST",
      body
    })
};

export const vehicleApi = {
  makes: () => request("/api/customer/vehicle/makes"),
  models: vehicleMakeId => request(`/api/customer/vehicle/models?vehicleMakeId=${vehicleMakeId}`),
  list: body =>
    request("/api/customer/vehicle/list", {
      method: "POST",
      body
    }),
  details: id => request(`/api/customer/vehicle/${id}`),
  create: body =>
    request("/api/customer/vehicle/create", {
      method: "POST",
      body
    }),
  update: (id, body) =>
    request(`/api/customer/vehicle/${id}`, {
      method: "PUT",
      body
    }),
  remove: id => request(`/api/customer/vehicle/${id}`, { method: "DELETE" }),
  makeDefault: id =>
    request(`/api/customer/vehicle/${id}/default`, {
      method: "PATCH",
      body: { isDefault: true }
    })
};

export const addressApi = {
  list: () =>
    request("/api/customer/address/list", {
      method: "POST",
      body: {}
    }),
  details: id => request(`/api/customer/address/${id}`),
  dropdown: () => request("/api/customer/address/dropdown"),
  create: body =>
    request("/api/customer/address/create", {
      method: "POST",
      body
    }),
  update: (id, body) =>
    request(`/api/customer/address/${id}`, {
      method: "PUT",
      body
    }),
  remove: id => request(`/api/customer/address/${id}`, { method: "DELETE" }),
  makeDefault: id => request(`/api/customer/address/${id}/default`, { method: "PATCH" })
};
