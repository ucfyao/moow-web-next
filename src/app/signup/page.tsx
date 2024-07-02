'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import '../styles/signup.css';
import axios from 'axios';
import {getInvalidFields} from '../utils/validator';
import { useRouter } from 'next/navigation'
import '../../../i18n';
import { useTranslation } from 'next-i18next';


interface InvalidFields {
  name?: { message: string }[];
  email?: { message: string }[];
  password?: { message: string }[];
  confirmPassword?: { message: string }[];
  captcha?: { message: string }[];
  refCode?: { message: string }[];
}

const Signup = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isSubmiting, setIsSubmiting] = useState(false);

  //data initialization
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    captcha: '',
    refCode: '',
  });

  //handle text input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  //confirm password
  const validatePass = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(t('validator.password_required'));
    } else if (formData.confirmPassword) {
      validatePassCheck(null, formData.confirmPassword, callback);
    } else {
      callback();
    }
  };
  const validatePassCheck = (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(t('validator.confirm_password_required'));
    } else if (value !== formData.password) {
      callback(t('validator.password_dont_match'));
    } else {
      callback();
    }
  };

  //input rules
  const rules = () => ({
    email: [
      { required: true, message: t('validator.account_required') },
      { type: 'email', message: t('validator.invalid_email') },
    ],
    password: [
      { required: true, message: t('validator.password_required') },
      { validator: validatePass },
    ],
    confirmPassword: [
      { validator: validatePassCheck }],
    captcha: [
      { required: true, message: t('validator.captcha_required') },
    ],
    refCode: [
      { required: false, message: t('validator.ref_required') },
    ],
  });

  // handle Captcha picture
  const updateCaptcha = async () => {
    const response = await axios.get('http://127.0.0.1:3000/api/v1/captcha?');
    setCaptchaSrc(response.data);
  };

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const refCode = query.get('ref_code');
    if (refCode) {
      setFormData((prevData) => ({ ...prevData, refCode }));
    }
    updateCaptcha();
  }, []);

  // handle signup button
  const handleSignup = async () => {
    const invalidFields = await getInvalidFields(formData, rules());
    if (invalidFields) {
      setInvalidFields(invalidFields);
      return;
    }
    setIsSubmiting(true);
    try {
      const response = await axios.post('http://127.0.0.1:3000/api/v1/auth/signup', formData);
      setIsSubmiting(false);
      const data = response.data;
      const userId = data?.userId;
      alert('Successful registration, quick activation');
      router.push('/activate');
    } catch (error: any) {
      updateCaptcha();
      setIsSubmiting(false);
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
                    {t('sign_up')}
                  </p>
                </header>
                <div className = 'card-content'>
                  <div className = 'field'>
                    <div className = 'control has-icons-left has-icons-right'>
                      <input 
                        className='input'
                        type = 'text' 
                        placeholder = {t('placeholder.name')} 
                        name='name'
                        value = {formData.name} 
                        onChange={handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-envelope'></i>
                      </span>
                    </div>
                    {invalidFields.name && <p className='help is-danger'></p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left has-icons-right'>
                      <input 
                        className='input'
                        type = 'email' 
                        placeholder = {t('placeholder.email')} 
                        name='email'
                        value = {formData.email} 
                        onChange={handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-envelope'></i>
                      </span>
                    </div>
                    {invalidFields.email && <p className="help is-danger">{invalidFields.email}</p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left'>
                      <input 
                        className='input'
                        type='password' 
                        placeholder = {t('placeholder.password')} 
                        name='password'
                        value = {formData.password} 
                        onChange={handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-lock'></i>
                      </span>
                    </div>
                    {invalidFields.password && <p className='help is-danger'>{invalidFields.password}</p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left'>
                      <input 
                        className='input'
                        type='password' 
                        placeholder = {t('placeholder.repeat_password')}
                        name='confirm_password'
                        value = {formData.confirmPassword} 
                        onChange={handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-lock'></i>
                      </span>
                    </div>
                    {invalidFields.confirmPassword && <p className="help is-danger">{invalidFields.confirmPassword}</p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'control has-icons-left'>
                      <input 
                        className='input'
                        type='text' 
                        placeholder = {t('placeholder.invitation_code')}
                        name='ref_code'
                        value = {formData.refCode} 
                        onChange={handleChange}
                      />
                      <span className = 'icon is-small is-left'>
                        <i className = 'fa fa-lock'></i>
                      </span>
                    </div>
                    {invalidFields.refCode && <p className="help is-danger">{invalidFields.refCode}</p>}
                  </div>
                  <div className = 'field'>
                    <div className = 'field is-grouped'>
                      <p className = 'control is-expanded'>
                        <input 
                          className='input'
                          type='text' 
                          placeholder={t('placeholder.captcha')} 
                          name='captcha'
                          value={formData.captcha} 
                          onChange={handleChange}
                        />
                      </p>    
                      <div className ='control' dangerouslySetInnerHTML={{ __html: captchaSrc }} 
                        title={t('prompt.click_refresh_captcha')} 
                        onClick={updateCaptcha}
                      />

                    </div>
                    {invalidFields.captcha && <p className="help is-danger">{invalidFields.captcha}</p>}
                  </div>
                  <div className='field' style={{ marginTop: '30px' }}>
                    <p className='control'>
                      <button 
                        className={`button is-link is-fullwidth is-focused ${isSubmiting ? 'is-loading' : ''}`}
                        onClick={handleSignup}
                        disabled={isSubmiting}>
                        Sign Up
                      </button>
                    </p>
                  </div>
                </div>
                <footer className='card-footer'>
                  <p className='card-footer-item'>
                    Have Registered? 
                    <a href='/login'>Sign In</a>
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



export default Signup;
