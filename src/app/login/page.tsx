'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import '../styles/login.css';
import axios from 'axios';
import auth from '../utils/auth'
import {getInvalidFields} from '../utils/validator'
import '../../styles/globals.css';

interface InvalidFields {
  email?: { message: string }[];
  password?: { message: string }[];
  captcha?: { message: string }[];
}

const Login = () => {
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captcha: '',
  });
  const rules = () => ({
    email: [
      { required: true, message: ('validator.account_required') },
      { type: 'email', message: ('validator.invalid_email') },
    ],
    password: [
      { required: true, message: ('validator.password_required') },
      { type: 'string', min: 6, max: 32, message: ('validator.invalid_password') },
    ],
    captcha: [
      { required: true, message: ('validator.captcha_required') },
    ],
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isLoging, setIsLoging] = useState(false);


  useEffect(() => {
    updateCaptcha();
  }, []);

  const updateCaptcha = () => {
    setCaptchaSrc('/api/pub/auth/svgCaptcha?' + Math.random());
  };

  const handleLogin = async () => {
    const invalidFields = await getInvalidFields(formData, rules())
    if (invalidFields) {
      setInvalidFields(invalidFields);
      return;
    }
    setIsLoging(true);
    try {
      let response = await axios.post('/pub/auth/signin', formData);
      let userData = response.data || null;
      if (auth.login(userData)) {
        // 
        //dispatch({ type: 'SET_USER', payload: auth.getUser() });
        //dispatch({ type: 'SET_ISAUTHENTICATED', payload: auth.isAuthenticated() });
        //let toPath = new URLSearchParams(window.location.search).get('redirect') || '/';
        //navigate(toPath);
      } else {
        alert('Login failed, server returned incorrect data');
      }
      setIsLoging(false);
    } catch (error) {
      alert(error || 'prompt.error_occurs');
      setIsLoging(false);
    }
  };

  return (
    <div>
      <section className='section home'>
        <div className='container login-wrap'>
          <div className='columns'>
            <div className='column has-text-white-bis is-hidden-mobile pt-200'>
            </div>
            <div className='column'>
              <div className='card '>
                <header className='card-header'>
                  <p className='card-header-title is-centered'>
                    Sign In
                  </p>
                </header>
                <div className = 'card-content'>
                  <div className = 'field'>
                    <div className = 'control has-icons-left has-icons-right'>
                      <input 
                        className='input'
                        type = 'email' 
                        placeholder = 'placeholder.email' 
                        value = {formData.email} 
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-envelope'></i>
                      </span>
                    </div>
                    {invalidFields.email && <p className='help is-danger'></p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left'>
                      <input 
                        className='input'
                        type='password' 
                        placeholder = 'placeholder.password' 
                        value = {formData.password} 
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-lock'></i>
                      </span>
                    </div>
                    {invalidFields.password && <p className='help is-danger'></p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'field is-grouped'>
                      <p className = 'control is-expanded'>
                        <input 
                          className='input'
                          type='text' 
                          placeholder='placeholder.captcha' 
                          value={formData.captcha} 
                        />
                      </p>
                      <p className ='control'>
                        <Image                 
                          className='captcha' 
                          src={captchaSrc} 
                          alt='prompt.click_refresh_captcha' 
                          title='prompt.click_refresh_captcha' 
                          onClick={updateCaptcha}
                          width={150}
                          height={50}
                        />       

                      </p>
                    </div>
                    {invalidFields.captcha && <p className='help is-danger'></p>}
                  </div>
                  <div className='field' style={{ marginTop: '30px' }}>
                    <p className='control'>
                      <button 
                        className={`button is-link is-fullwidth is-focused ${isLoging ? 'is-loading' : ''}`}
                        onClick={handleLogin}
                        disabled={isLoging}>
                        Sign In
                      </button>
                    </p>
                  </div>
                  <div className='field'>
                    <div className='control forget-password'>
                      <a href='/forgetPassword'>Forgot Password?</a>
                    </div>
                  </div>
                </div>
                <footer className='card-footer'>
                  <p className='card-footer-item'>
                    Don't have an account? 
                    <a href='/signup'>Sign Up Now</a>
                  </p>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='section feature'>
        <nav className='columns'>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Multiple Strategies</strong>
              </p>
              <p className='subtitle is-6'>Ordinary price investment, intelligent value investment, etc.</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Strict Risk Control</strong>
              </p>
              <p className='subtitle is-6'>Secure storage and strict operation flow</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Transparent Transactions</strong>
              </p>
              <p className='subtitle is-6'>One-click hosting, transparent API transactions</p>
            </div>
          </div>
          <div className='column has-text-centered'>
            <div>
              <p className='title is-4'>
                <strong>Open Data</strong>
              </p>
              <p className='subtitle is-6'>Multidimensional and intuitive visualization of investment data</p>
            </div>
          </div>
        </nav>
      </section>
    </div>
  );
};

export default Login;
