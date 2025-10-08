import { useState } from 'react';
import { authService } from '../../services/auth.js';
import Register from './Register.jsx';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    password: ''
  });

  const validateField = (name, value) => {
    const errors = { ...validationErrors };

    if (name === 'username') {
      if (value.includes(' ')) {
        errors.username = 'O nome de usuário não pode conter espaços';
      } else {
        errors.username = '';
      }
    }

    if (name === 'password') {
      if (value.includes(' ')) {
        errors.password = 'A senha não pode conter espaços';
      } else {
        errors.password = '';
      }
    }

    setValidationErrors(errors);
    return !errors.username && !errors.password;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Remove espaços automaticamente se o usuário tentar digitar
    const cleanValue = value.replace(/\s/g, '');

    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));

    validateField(name, cleanValue);
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    // Validação adicional antes de submeter
    if (formData.username.includes(' ')) {
      setError('O nome de usuário não pode conter espaços');
      return;
    }

    if (formData.password.includes(' ')) {
      setError('A senha não pode conter espaços');
      return;
    }

    // Verificar se há erros de validação
    if (validationErrors.username || validationErrors.password) {
      setError('Por favor, corrija os erros antes de continuar');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.login(formData.username, formData.password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    setSuccessMessage('Cadastro criado com sucesso! Faça login com suas credenciais.');
    setShowRegister(false);
    setFormData({ username: '', password: '' });
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (showRegister) {
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>Job Board</h1>
        <h2>Faça seu login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Usuário:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={isLoading}
              placeholder="Digite seu usuário"
            />
            {validationErrors.username && (
              <div className="field-error">{validationErrors.username}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 14.12 16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <div className="field-error">{validationErrors.password}</div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="create-account">
          <p>Ainda não tem uma conta?</p>
          <button
            type="button"
            className="create-account-button"
            onClick={() => setShowRegister(true)}
            disabled={isLoading}
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
