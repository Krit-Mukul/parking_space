export const AUTH = {
  DRIVER_REGISTER: "/auth/register",
  DRIVER_LOGIN: "/auth/login",
  ADMIN_SIGNUP: "/admin/auth/signup",
  ADMIN_LOGIN: "/admin/auth/login",
};

export const DRIVER = {
  VEHICLES: "/driver/vehicles",
  DELETE_VEHICLE: (id) => `/driver/vehicles/${id}`,
  RESERVE: "/driver/reserve",
  PAY: "/driver/pay",
  RESERVATIONS: "/driver/reservations",
  CANCEL_RESERVATION: (id) => `/driver/reservations/${id}`,
  SLOTS: "/driver/slots",
};

export const ADMIN = {
  SLOTS: "/admin/slots",
  REPORT: "/admin/report",
  PAYMENTS: "/admin/payments",
  RESERVATIONS: "/admin/reservations",
};
