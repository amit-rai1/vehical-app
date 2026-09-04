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
  list: (body = {}) =>
    request("/api/customer/address/list", {
      method: "POST",
      body: {
        pageNumber: 1,
        pageSize: 100,
        ...body
      }
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
  makeDefault: id =>
    request(`/api/customer/address/${id}/default`, {
      method: "PATCH",
      body: { isDefault: true }
    })
};

export const catalogApi = {
  list: vehicleType =>
    request(
      `/api/customer/services${
        vehicleType ? `?vehicleType=${encodeURIComponent(vehicleType)}` : ""
      }`
    )
};

export const planApi = {
  list: params => {
    const search = new URLSearchParams();
    if (params?.pageNumber) search.append("pageNumber", String(params.pageNumber));
    if (params?.pageSize) search.append("pageSize", String(params.pageSize));
    if (typeof params?.isActiveOnly === "boolean") {
      search.append("isActiveOnly", String(params.isActiveOnly));
    }
    const query = search.toString();
    return request(`/api/customer/plans${query ? `?${query}` : ""}`);
  },
  get: id => request(`/api/customer/plans/${id}`),
  purchase: body =>
    request("/api/customer/plans/purchase", {
      method: "POST",
      body
    })
};

export const paymentApi = {
  confirmRazorpay: body =>
    request("/api/customer/payments/razorpay/confirm", {
      method: "POST",
      body
    })
};

export const bookingApi = {
  create: body =>
    request("/api/customer/bookings", {
      method: "POST",
      body
    }),
  list: params => {
    const search = new URLSearchParams();
    if (params?.pageNumber) search.append("pageNumber", String(params.pageNumber));
    if (params?.pageSize) search.append("pageSize", String(params.pageSize));
    if (params?.status) search.append("status", String(params.status));
    if (params?.fromDate) search.append("fromDate", params.fromDate);
    if (params?.toDate) search.append("toDate", params.toDate);
    const query = search.toString();
    return request(`/api/customer/bookings${query ? `?${query}` : ""}`);
  },
  get: id => request(`/api/customer/bookings/${id}`)
};

export const skipRequestApi = {
  create: body =>
    request("/api/customer/skip-requests", {
      method: "POST",
      body
    }),
  list: (pageNumber = 1, pageSize = 20) =>
    request(`/api/customer/skip-requests?pageNumber=${pageNumber}&pageSize=${pageSize}`)
};

export const partnerApi = {
  listJobs: params => {
    const search = new URLSearchParams();
    if (params?.pageNumber) search.append("pageNumber", String(params.pageNumber));
    if (params?.pageSize) search.append("pageSize", String(params.pageSize));
    if (params?.status != null && params?.status !== "") {
      search.append("status", String(params.status));
    }
    if (params?.todayOnly) search.append("todayOnly", "true");
    const query = search.toString();
    return request(`/api/partner/bookings${query ? `?${query}` : ""}`);
  },
  getJob: id => request(`/api/partner/bookings/${id}`),
  startJob: id =>
    request(`/api/partner/bookings/${id}/start`, {
      method: "PATCH"
    }),
  completeJob: (id, body) =>
    request(`/api/partner/bookings/${id}/complete`, {
      method: "POST",
      body
    })
};

export const invoiceApi = {
  list: params => {
    const search = new URLSearchParams();
    if (params?.pageNumber) search.append("pageNumber", String(params.pageNumber));
    if (params?.pageSize) search.append("pageSize", String(params.pageSize));
    const query = search.toString();
    return request(`/api/customer/invoices${query ? `?${query}` : ""}`);
  }
};

export const feedbackApi = {
  submit: body =>
    request("/api/customer/feedback", {
      method: "POST",
      body
    }),
  list: () => request("/api/customer/feedback")
};

export const bannerApi = {
  list: () => request("/api/customer/banners")
};

export const locationApi = {
  check: pincode =>
    request(`/api/customer/locations/check?pincode=${encodeURIComponent(pincode || "")}`),
  requestArea: body =>
    request("/api/customer/locations/requests", {
      method: "POST",
      body
    })
};

export const helpApi = {
  list: () => request("/api/customer/help"),
  create: body =>
    request("/api/customer/help", {
      method: "POST",
      body
    })
};

export const profileApi = {
  customer: () => request("/api/customer/profile"),
  partner: () => request("/api/partner/profile")
};
