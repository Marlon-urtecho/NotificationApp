import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // Usamos 'username' en lugar de 'email'
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Hacemos la petición al servidor para obtener los tokens
      const response = await fetch(
        "http://localhost:8000/AutoMensaje/v1/api/token/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username, // Usamos 'username' en lugar de 'email'
            password: password, // Enviamos la contraseña
          }),
        },
      );

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Credenciales incorrectas.");
      }

      // Verificamos si los tokens están presentes en la respuesta
      if (data.access && data.refresh) {
        console.log("Tokens recibidos:", data);

        // Almacenar los tokens en localStorage
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh_token", data.refresh); // Guardar refresh token

        // Actualizamos el estado de la autenticación
        setIsAuthenticated(true);

        // Redirigimos al dashboard o página principal
        navigate("/");
      } else {
        throw new Error("Tokens no recibidos del servidor.");
      }
    } catch (error) {
      setError(error.message); // Mostramos el error en la interfaz
    } finally {
      setLoading(false); // Cambiamos el estado de 'loading'
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 h-100 shadow-lg rounded overflow-hidden">
        {/* Imagen de la izquierda */}
        <div className="col-md-6 d-none d-md-block p-0">
          <img
            src="https://www.rojassa.com/wp-content/uploads/2015/04/seguros-para-vehiculos-costa-rica.jpg"
            alt="Fondo de Login"
            className="img-fluid h-100 w-100 object-fit-cover"
          />
        </div>

        {/* Sección del formulario */}
        <div className="h-100 col-md-6 p-5 d-flex flex-column align-items-center justify-content-center">
          <img
            src="../logo prisma claro.jpg"
            alt="Logo Empresa"
            className="mb-3 img-fluid"
          />

          <h2 className="mb-3">Bienvenido</h2>
          <h3 className="mb-4">Ingrese sus datos de acceso</h3>

          {/* Mostrar el error si existe */}
          {error && <div className="alert alert-danger w-100">{error}</div>}

          <form className="w-100" onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Nombre de Usuario
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-user" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  placeholder="Ingrese su nombre de usuario"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock" />
                </span>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  placeholder="Ingrese su contraseña"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mt-3"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
