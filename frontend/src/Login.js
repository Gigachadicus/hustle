import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import './login.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom';


const LoginPage = ({ onSwitchToSignup }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  }); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setErrorMessage('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    
    try {
      const result = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.email, password: formData.password })
      });

      const resData = await result.json();
      
      if (resData.message === 'Invalid credentials') {
        setErrorMessage('Invalid credentials, please try again');
        setIsLoading(false);
        return;
      }

      if (resData.message === 'User not found') {
        setErrorMessage('User not found try signing up');
        setIsLoading(false);
        return;
      }

      const token = resData.accessToken;

      setTimeout(() => {
        setIsLoading(false);
        // Navigate to playlist builder would go here
        navigate('/playlistbuilder', { state: { token } });
        console.log('Login successful with token:', token);
      }, 1500);
    } catch (error) {
      setErrorMessage('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      {/* Animated background elements */}
      <div className="bg-animation">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
      
      <div className="auth-card">
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <div className="auth-header">
          <div className="auth-icon login-icon">
            <Sparkles size={32} color="white" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <div className="form-container">
          {/* Email Field */}
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input login-input"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input login-input password-input"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-row">
            <label className="checkbox-group">
              <input type="checkbox" />
              <span className="checkbox-label">Remember me</span>
            </label>
            <a href="#" className="link login-link">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="auth-button login-button"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <div className="button-content">
                <span>Sign In</span>
                <ArrowRight className="button-icon" size={16} />
              </div>
            )}
          </button>
        </div>

        {/* Switch to Signup */}
        <div className="switch-section">
          <p className="switch-text">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignup}
              className="switch-button signup-switch"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignupPage = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);



  const handleSubmit = async () => {
    if (!termsAccepted) {
      setErrorMessage('You must accept the Terms and Conditions to proceed');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage('Invalid email format');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password should be more than 8 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.userName,
          email: formData.email,
          password: formData.password,
        })
      });

      const resData = await result.json();
      const token = resData.accessToken;

      if (result.status === 409) {
        setErrorMessage(resData.error || 'User already exists');
        setIsLoading(false);
        return;
      }

      if (resData.success) {
        navigate('/playlistbuilder', { state: { token, username: formData.userName } });
      }
      
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Connection error. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrorMessage('');
  };

  return (
    <div className="signup-container">
      {/* Animated background elements */}
      <div className="bg-animation">
        <div className="bg-circle signup-bg-circle-1"></div>
        <div className="bg-circle signup-bg-circle-2"></div>
        <div className="bg-circle signup-bg-circle-3"></div>
      </div>
      
      <div className="auth-card">

        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}

        <div className="auth-header">
          <div className="auth-icon signup-icon">
            <User size={32} color="white" />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join us today</p>
        </div>

        <div className="form-container">
          {/* Full Name Field */}
          <div className="input-group">
            <User className="input-icon" size={20} />
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="form-input signup-input"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email Field */}
          <div className="input-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input signup-input"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input signup-input password-input"
              placeholder="Create a password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input signup-input password-input"
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Terms Agreement */}
          <div className="terms-group">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />

            <span className="terms-text">
              I agree to the{' '}
              <a href="#" className="link signup-link">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="link signup-link">
                Privacy Policy
              </a>
            </span>
          </div>

          {/* Signup Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="auth-button signup-button"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <div className="button-content">
                <span>Create Account</span>
                <ArrowRight className="button-icon" size={16} />
              </div>
            )}
          </button>
        </div>

        {/* Switch to Login */}
        <div className="switch-section">
          <p className="switch-text">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="switch-button login-switch"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <div>
      {currentPage === 'login' ? (
        <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} />
      ) : (
        <SignupPage onSwitchToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
};

export default App;