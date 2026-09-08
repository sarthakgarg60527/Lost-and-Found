import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use(
  (config) => {

    const publicRoutes = [
      "/auth/login",
      "/auth/register",
    ];

    const isPublicRoute =
      publicRoutes.some((route) =>
        config.url.includes(route)
      );

    if (!isPublicRoute) {

      // 🛡️ ADMIN SIDE
      if (
        window.location.pathname.startsWith(
          "/admin"
        )
      ) {

        const adminToken =
          localStorage.getItem(
            "admin_token"
          );

        if (adminToken) {

          config.headers.Authorization =
            `Bearer ${adminToken}`;
        }

        console.log(
          "🛡️ ADMIN TOKEN:",
          adminToken
        );

      }

      // 👤 USER SIDE
      else {

        const userToken =
          localStorage.getItem(
            "user_token"
          );

        if (userToken) {

          config.headers.Authorization =
            `Bearer ${userToken}`;
        }

        console.log(
          "👤 USER TOKEN:",
          userToken
        );
      }

      console.log(
        "🔥 API:",
        config.url
      );
    }

    return config;
  },

  (error) => Promise.reject(error)
);

export default API;