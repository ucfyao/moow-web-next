'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import '../styles/resetPassword.css';
import axios from 'axios';
import {getInvalidFields} from '../utils/validator'

interface InvalidFields {
  password?: { message: string }[];
  passwordCheck?: { message: string }[];
}
const resetPassword = () => {
  const [captchaSrc, setCaptchaSrc] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    passwordCheck: '',
  });
  const rules = () => ({
    password: [
      { required: true, message: ('validator.password_required') },
      { validator: validatePass, trigger: 'blur' },
    ],
    passwordCheck: [
      { validator: validatePassCheck, trigger: 'blur' },
    ],
  });
  const [invalidFields, setInvalidFields] = useState<InvalidFields>({});
  const [isProccessing, setIsProccessing] = useState(false);
  
  const router = useRouter();

  const formRef = useRef<any>(null);
  const validatePass = (rule: any, value: string) => {
    if (value === '') {
      return Promise.reject(new Error('validator.password_required'));
    } else {
      if (formData.passwordCheck !== '') {
        // Verify the second password box separately
        formRef.current.validateField(['passwordCheck']);
      }
      return Promise.resolve();
    }
  };
  const validatePassCheck = (rule: any, value: string) => {
    if (value === '') {
      return Promise.reject(new Error('validator.confirm_password_required'));
    } else if (value !== formData.password) {
      return Promise.reject(new Error('validator.password_dont_match'));
    } else {
      return Promise.resolve();
    }
  };
  useEffect(() => {
    updateCaptcha();
  }, []);

  const updateCaptcha = () => {
    setCaptchaSrc('/api/pub/auth/svgCaptcha?' + Math.random());
  };

  const handleResetPassword = async () => {
    const { token } = router.query;
    const invalidFields = await getInvalidFields(formData, rules())
    if (invalidFields) {
      setInvalidFields(invalidFields);
      return;
    }
    setIsProccessing(true);
    try {
      let response = await axios.post('/pub/auth/resetPassword', {
        token,
        password: formData.password
      });
      setIsProccessing(false);
      alert('prompt.password_is_reset');
      router.push('/login');
    } catch (error) {
      alert(error || 'prompt.error_occurs');
      setIsProccessing(false);
    }
  };

  return (
    <div>
      <section className='section'>
        <div className='container'>
          <div className='box'>
            <div className='header'>
              <p className='is-size-6 is-pulled-left margin-right: 10px;'>{('caption.reset_password')}</p>
            </div>
            <div className='field'>
              <label className='label'><span className='has-text-danger'>*</span>{('label.input')}{('label.new_password')}</label>
              <div className='control has-icons-left'>
                <input 
                  className='input' type='password' value={formData.password} placeholder='password'
                />
                <span className='icon is-small is-left'>
                    <i className='fa fa-lock'></i>
                  </span>
              </div>
              {invalidFields.password && <p className='help is-danger' ></p>}
            </div>
            <div className='field'>
              <label className='label'><span className='has-text-danger'>*</span>{('label.input')}{('label.confirm_password')}</label>
              <div className='control has-icons-left'>
                <input 
                  className='input' type='password' value={formData.passwordCheck} placeholder='Confirm password'
                />
                <span className='icon is-small is-left'>
                    <i className='fa fa-lock'></i>
                  </span>
              </div>
              {invalidFields.passwordCheck && <p className='help is-danger' ></p>}
            </div>
            <div className='field is-grouped'>
              <div className='control'>
                <button 
                  className={`button is-link is-fullwidth is-focused ${isProccessing ? 'is-loading' : ''}`}
                  onClick={handleResetPassword}
                  disabled={isProccessing}>
                  {('action.confirm')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default resetPassword;
