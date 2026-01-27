import axios from "axios";

const api = axios.create({
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

api.interceptors.request.use(
  (config) => {
    const session = localStorage.getItem("session");

    if (session) {
      const token = JSON.parse(session)?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("session");
    }

    return Promise.reject(error);
  }
);

export const getAPI = (url, config = {}) => api.get(url, config);

export const postAPI = (url, payload, config = {}) =>
  api.post(url, payload, config);

export const putAPI = (url, payload, config = {}) =>
  api.put(url, payload, config);

export const patchAPI = (url, payload, config = {}) =>
  api.patch(url, payload, config);

export const deleteAPI = (url, config = {}) =>
  api.delete(url, config);

export default api;
