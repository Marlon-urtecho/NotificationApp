import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');  // Cambié 'email' a 'username'
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/AutoMensaje/v1/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,  // Usamos el 'username' en lugar del 'email'
          password: password   // Enviamos la contraseña
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en las credenciales');
      }

      // Almacenar los tokens en el localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('refresh_token', data.refresh_token);  // Guardar refresh token
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-fluid vh-100 d-flex align-items-center justify-content-center'>
      <div className='row w-100 h-100 shadow-lg rounded overflow-hidden'>
        {/* Imagen de la izquierda */}
        <div className='col-md-6 d-none d-md-block p-0'>
          <img
            src='https://www.rojassa.com/wp-content/uploads/2015/04/seguros-para-vehiculos-costa-rica.jpg'
            alt='Fondo de Login'
            className='img-fluid h-100 w-100 object-fit-cover'
          />
        </div>

        {/* Sección del formulario */}
        <div className='h-100 col-md-6 p-5 d-flex flex-column align-items-center justify-content-center'>
          <img src='../logo prisma claro.jpg' alt='Logo Empresa' className='mb-3 img-fluid' />

          <h2 className='mb-3'>Bienvenido</h2>
          <h3 className='mb-4'>Ingrese sus datos de acceso</h3>

          {error && <div className='alert alert-danger w-100'>{error}</div>}

          <form className='w-100' onSubmit={handleLogin}>
            <div className='mb-3'>
              <label htmlFor='username' className='form-label'>Nombre de Usuario</label>
              <div className='input-group'>
                <span className='input-group-text'><i className='fas fa-user' /></span>
                <input 
                  type='text' 
                  className='form-control' 
                  id='username' 
                  placeholder='Ingrese su nombre de usuario' 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
            </div>

            <div className='mb-3'>
              <label htmlFor='password' className='form-label'>Contraseña</label>
              <div className='input-group'>
                <span className='input-group-text'><i className='fas fa-lock' /></span>
                <input 
                  type='password' 
                  className='form-control' 
                  id='password' 
                  placeholder='Ingrese su contraseña' 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              type='submit' 
              className='btn btn-primary w-100 mt-3'
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;