// export const BASE_URL = location.hostname === "localhost" ? "http://localhost:3007" : "/api";

export const BASE_URL = import.meta.env.PROD
  ? "/api"                    // nginx proxy in production
  : "http://localhost:3007";  // local dev