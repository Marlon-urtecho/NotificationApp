import "bootstrap/dist/css/bootstrap.min.css"; // Importar Bootstrap
import React, { useState } from "react";
import axios from "axios";

function ImportarClientes() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [message1, setMessage1] = useState(null);
  const [message2, setMessage2] = useState(null);
  const [loading1, setLoading1] = useState(false); // Para mostrar spinner en el primer formulario
  const [loading2, setLoading2] = useState(false); // Para mostrar spinner en el segundo formulario

  const token = localStorage.getItem("token"); // Obtener el token desde localStorage

  // Asegurarse de que el token está presente
  if (!token) {
    setMessage1({
      text: "No estás autenticado. Inicia sesión para continuar.",
      type: "danger",
    });
  }

  // Configuración de Axios con el token
  const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/AutoMensaje/v1/",
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`, // Enviar el token en las cabeceras
    },
  });

  const handleFileChange1 = (e) => {
    setFile1(e.target.files[0]);
  };

  const handleFileChange2 = (e) => {
    setFile2(e.target.files[0]);
  };

  const handleUpload1 = async () => {
    if (!file1) {
      setMessage1({
        text: "Por favor, selecciona un archivo para el formato Bac",
        type: "danger",
      });
      return;
    }

    setLoading1(true); // Inicia el spinner

    const formData = new FormData();
    formData.append("file", file1);

    try {
      const response = await axiosInstance.post(
        "api/importar-clientes/",
        formData,
      );

      const data = response.data;

      if (response.status === 200) {
        setMessage1({
          text: "Clientes importados correctamente en el primer formato",
          type: "success",
        });
      } else {
        setMessage1({
          text: `Error al importar: ${data.message}`,
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Error de red:", error);
      setMessage1({
        text: "Hubo un problema al cargar el archivo.",
        type: "danger",
      });
    } finally {
      setLoading1(false); // Detener el spinner
    }
  };

  const handleUpload2 = async () => {
    if (!file2) {
      setMessage2({
        text: "Por favor, selecciona un archivo para el formato La Fise",
        type: "danger",
      });
      return;
    }

    setLoading2(true); // Inicia el spinner

    const formData = new FormData();
    formData.append("file", file2);

    try {
      const response = await axiosInstance.post(
        "api/importar_clientes_desde_b2/",
        formData,
      );

      const data = response.data;

      if (response.status === 200) {
        setMessage2({
          text: "Clientes importados correctamente en el segundo formato",
          type: "success",
        });
      } else {
        setMessage2({
          text: `Error al importar: ${data.message}`,
          type: "danger",
        });
      }
    } catch (error) {
      console.error("Error de red:", error);
      setMessage2({
        text: "Hubo un problema al cargar el archivo.",
        type: "danger",
      });
    } finally {
      setLoading2(false); // Detener el spinner
    }
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4 text-center text-primary">Importar Clientes</h3>

      {/* Primer formulario */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title text-secondary">Formato Bac</h4>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange1}
              accept=".xlsx, .xls, .csv"
            />
          </div>
          <button
            className={`btn btn-primary ${loading1 ? "disabled" : ""}`}
            onClick={handleUpload1}
            disabled={loading1}
          >
            {loading1 ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Subir Archivo"
            )}
          </button>
          {message1 && (
            <div
              className={`alert alert-${message1.type} mt-3 fade show`}
              role="alert"
            >
              {message1.text}
            </div>
          )}
        </div>
      </div>

      {/* Segundo formulario */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="card-title text-secondary">Formato La Fise</h4>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange2}
              accept=".xlsx, .xls, .csv"
            />
          </div>
          <button
            className={`btn btn-primary ${loading2 ? "disabled" : ""}`}
            onClick={handleUpload2}
            disabled={loading2}
          >
            {loading2 ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              "Subir Archivo"
            )}
          </button>
          {message2 && (
            <div
              className={`alert alert-${message2.type} mt-3 fade show`}
              role="alert"
            >
              {message2.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImportarClientes;
