import React, { useState, useEffect, useCallback, useRef } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const Login = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle, loading, error, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);
  const loginSuccessRef = useRef(false);

  const handleGoogleSignIn = useCallback(async (response) => {
    console.log('Login component: Google sign-in callback triggered', response);
    
    // Check if response is valid
    if (!response || !response.credential) {
      console.error('Login component: Invalid Google response', response);
      // Error will be shown by AuthContext through error state
      return;
    }
    
    try {
      console.log('Login component: Calling loginWithGoogle with credential...');
      
      const ok = await loginWithGoogle(response, rememberMe);
      console.log('Login component: loginWithGoogle result:', ok);
      
      if (ok) {
        console.log('Login component: Login successful, setting success state');
        setSuccess(true);
        loginSuccessRef.current = true;
        // Navigate after short delay so state updates
        setTimeout(() => {
          console.log('Login component: Navigating to account page');
          navigate('/account', { replace: true });
        }, 500);
      } else {
        console.log('Login component: Login failed');
        loginSuccessRef.current = false;
        // Error is already set in AuthContext
      }
    } catch (error) {
      console.error('Login component: Google sign-in error:', error);
      // Error is already set in AuthContext
    }
  }, [loginWithGoogle, rememberMe, navigate]);

  // Initialize Google OAuth
  useEffect(() => {
    const initGoogleOAuth = () => {
      if (window.google) {
        console.log('Initializing Google OAuth...');
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        console.log('Google OAuth initialized with client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
      } else {
        setTimeout(initGoogleOAuth, 100);
      }
    };
    
    initGoogleOAuth();
  }, []);

  // Initialize Google OAuth button
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max
    
    const initGoogleAuth = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        // Clear any existing button
        const buttonContainer = document.getElementById('google-signin-button');
        if (!buttonContainer) {
          console.warn('Google sign-in button container not found');
          return;
        }
        
        buttonContainer.innerHTML = '';
        
        try {
          // Render the button with our callback
          window.google.accounts.id.renderButton(
            buttonContainer,
            {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
              callback: handleGoogleSignIn
            }
          );
          console.log('Google Sign-In button rendered successfully with callback');
        } catch (error) {
          console.error('Error rendering Google button:', error);
        }
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          // Retry if Google script hasn't loaded yet
          setTimeout(initGoogleAuth, 100);
        } else {
          console.error('Google script failed to load after maximum retries');
        }
      }
    };

    // Delay to ensure DOM is ready
    setTimeout(initGoogleAuth, 100);
  }, [handleGoogleSignIn]);

  // Navigate after successful login (if user state updates)
  useEffect(() => {
    if (user && loginSuccessRef.current) {
      console.log('Login component: User state updated, navigating...');
      loginSuccessRef.current = false;
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password, rememberMe);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('/account', { replace: true }), 1000);
    }
  };

  return (
    <Layout>
      <SEO
        title={t.loginTitle}
        description={t.loginDescription}
        canonical="/login"
      />

      <div className="w-full min-h-screen bg-stone-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[580px] w-full mx-auto flex flex-col gap-5">
            {/* Welcome Banner */}
            <div className="w-full px-8 md:px-14 py-6 md:py-10 relative bg-black rounded-xl flex justify-center items-center gap-4 overflow-hidden">
              <img 
                className="w-full h-96 absolute origin-center rotate-180 opacity-80" 
                src="/images/gradient_wallpaper.jpg" 
                alt="Background"
              />
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="flex flex-row items-center justify-center gap-3">
                  <span className="text-white text-lg md:text-2xl font-semibold font-['Manrope']">
                    {t.welcomeTo}
                  </span>
                  <span className="flex items-center gap-2.5">
                    <img
                      src="/icons/white_logo.svg"
                      alt="GeoSolver Logo"
                      className="w-9 md:w-10 h-9 md:h-10"
                    />
                    <span className="text-white text-lg md:text-xl font-bold font-['Manrope']">
                      GeoSolver
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form className="w-full flex flex-col justify-center items-center gap-2.5" onSubmit={handleSubmit}>
              <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-4">
                  {/* Email Input */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">
                      {t.email}
                    </label>
                    <input 
                      type="email"
                      placeholder={t.enterEmail}
                      className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">
                      {t.password}
                    </label>
                    <input 
                      type="password"
                      placeholder={t.enterPassword}
                      className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Remember Me & Login Button */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex justify-start items-center gap-3">
                    <input 
                      type="checkbox"
                      className="w-6 h-6 bg-white rounded border border-gray-200"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                    <span className="text-black text-sm font-medium font-['Manrope']">
                      {t.rememberMe}
                    </span>
                  </div>
                  <div className="flex justify-center items-center gap-3">
                    <a href="/forgot-password" className="text-neutral-400 text-sm font-medium font-['Manrope']">
                      {t.forgotPassword}
                    </a>
                    <button type="submit" className="px-4 py-2 bg-black rounded-lg text-white text-sm md:text-base font-medium font-['Manrope']" disabled={loading}>
                      {loading ? t.loggingIn : t.login}
                    </button>
                  </div>
                </div>
                {error && <div className="w-full text-red-500 text-sm font-medium font-['Manrope']">{error}</div>}
                {success && <div className="w-full text-green-600 text-sm font-medium font-['Manrope']">{t.successLogin}</div>}
              </div>

              {/* Divider */}
              <div className="text-neutral-400 text-sm font-medium font-['Manrope']">
                {t.or}
              </div>

              {/* Social Login & Register */}
              <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col md:flex-row justify-center items-center gap-3">
                <div id="google-signin-button" className="w-full md:flex-1"></div>
                <Link to="/register" className="w-full md:flex-1 px-3 py-2 bg-black rounded-lg flex justify-center items-center gap-3 text-white text-sm md:text-base font-medium font-['Manrope']">
                  {t.register}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 