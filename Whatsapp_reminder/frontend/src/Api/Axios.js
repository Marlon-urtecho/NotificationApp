import axios from "axios";

// Crear una instancia de Axios
const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/", // Cambia esto a tu URL de la API
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a todas las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Obtener el token de localStorage
    console.log("Token en la solicitud:", token); // Verifica que el token se obtenga correctamente

    if (token) {
      // Si el token existe, lo agregamos a las cabeceras
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Mostrar las cabeceras para verificar que se haya añadido el token
    console.log("Cabeceras de la solicitud:", config.headers);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para manejar respuestas y errores globales
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Si la respuesta es 401, significa que el token no es válido o ha expirado
    if (error.response && error.response.status === 401) {
      // Eliminar el token de localStorage si el token está expirado
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");

      // Opcional: Tratar de refrescar el token usando el refresh_token
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await axios.post(
            "http://127.0.0.1:8000/AutoMensaje/v1/api/token/refresh/",
            {
              refresh_token: refreshToken,
            },
          );

          // Si la respuesta es exitosa, almacenamos el nuevo token
          if (response.status === 200) {
            const { token, refresh_token } = response.data;
            localStorage.setItem("token", token);
            localStorage.setItem("refresh_token", refresh_token);

            // Intentamos reenviar la solicitud original con el nuevo token
            error.config.headers["Authorization"] = `Bearer ${token}`;
            return axios(error.config);
          }
        } catch (refreshError) {
          console.error("Error al refrescar el token:", refreshError);
        }
      }

      // Redirige al login si el refresh_token también es inválido o no existe
      window.location.href = "/login"; // Redirige al login
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
