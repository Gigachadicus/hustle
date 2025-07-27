import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const features = [
    {
      icon: "🏃‍♂️",
      title: "Start Exercise",
      description: "Begin your personalized workout session with AI-powered pose detection",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      action: () => navigate('/exercise')
    },
    {
      icon: "📋",
      title: "Build Playlist",
      description: "Create custom workout routines tailored to your fitness goals",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      action: () => navigate('/playlistbuilder')
    },
    {
      icon: "👤",
      title: "Login",
      description: "Access your personal fitness dashboard and track progress",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      action: () => navigate('/login')
    },
    {
      icon: "💎",
      title: "Premium",
      description: "Unlock advanced features and personalized coaching",
      color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      action: () => navigate('/subscription')
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "50+", label: "Exercise Types" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
        </div>
        
        <div className="hero-content">
          <div className="welcome-text">
            <h1 className="app-title">
              <span className="physio">Physio</span>
              <span className="fit">Fit</span>
            </h1>
            <p className="greeting">{getGreeting()}! Ready to transform your health?</p>
            <p className="tagline">
              AI-powered fitness coaching that adapts to your body and helps you achieve your goals
            </p>
          </div>
          
          <div className="cta-section">
            <button 
              className="primary-cta"
              onClick={() => navigate('/exercise')}
            >
              <span className="cta-icon">⚡</span>
              Start Your Workout
            </button>
            <button 
              className="secondary-cta"
              onClick={() => navigate('/playlistbuilder')}
            >
              Build Custom Plan
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Choose Your Path to Wellness</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="feature-card"
                onClick={feature.action}
                style={{ '--card-gradient': feature.color }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className="section-title">Trusted by Thousands</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="benefits-title">Why Choose PhysioFit?</h2>
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">🎯</div>
                  <div>
                    <h4>Precision Tracking</h4>
                    <p>Advanced AI analyzes your form in real-time for perfect execution</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">📈</div>
                  <div>
                    <h4>Progress Monitoring</h4>
                    <p>Track your improvement with detailed analytics and insights</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🏆</div>
                  <div>
                    <h4>Personalized Goals</h4>
                    <p>Customized workouts that adapt to your fitness level</p>
                  </div>
                </div>
                <div className="benefit-item">
                  <div className="benefit-icon">🔥</div>
                  <div>
                    <h4>Stay Motivated</h4>
                    <p>Gamified experience that keeps you engaged and consistent</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="benefits-visual">
              <div className="pulse-circle">
                <div className="inner-circle">
                  <span className="pulse-icon">💪</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h3 className="footer-logo">
                <span className="physio">Physio</span>
                <span className="fit">Fit</span>
              </h3>
              <p>Transform your health with AI-powered fitness coaching</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Get Started</h4>
                <a onClick={() => navigate('/exercise')}>Start Exercise</a>
                <a onClick={() => navigate('/playlistbuilder')}>Build Playlist</a>
                <a onClick={() => navigate('/login')}>Login</a>
              </div>
              <div className="link-group">
                <h4>Premium</h4>
                <a onClick={() => navigate('/subscription')}>Subscribe</a>
                <a>Features</a>
                <a>Pricing</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 PhysioFit. Empowering your fitness journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;