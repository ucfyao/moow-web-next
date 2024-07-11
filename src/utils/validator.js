/**
 * Created by wainguo on 2018/8/14.
 */

/*
Form validation helper class.
Input:
Form data, for example:
formData: {
  email: '',
  password: ''
},

Validation rules, for example:
rules: {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Password is required', trigger: 'blur' },
    { type: 'string', min: 6, max: 32, message: 'Password must be 6-32 characters long', trigger: 'blur' }
  ]
}

validate(formData, rules) will return:
[{"message":"Email is required","field":"email"},{"message":"Password is required","field":"password"}]

getInvalidFields(formData, rules) will return:
{"email":"Email is required", "password":"Password is required"}
*/

"use strict";
import Schema from 'async-validator'

const valid = (data, field, fieldRules) => {
  const promise = new Promise((resolve, reject) => {
    for (let rule of fieldRules) {
      const descriptor = {}
      descriptor[field] = rule
      const validator = new Schema(descriptor)
      validator.validate(data, (errors) => {
        if (errors) {
          reject(errors)
        }
      })
    }
    resolve('')
  })
  return promise
}

/*
 * Returns:
 * No invalid fields: returns false
 * Has invalid fields: returns an array containing all invalid fields, for example: [{"message":"Email is required","field":"email"},{"message":"Password is required","field":"password"}]
 */
export const validate = async (data, rules) => {
  if (!data || typeof data !== 'object'
    || !rules || typeof rules !== 'object') {
    return
  }

  const errors = []
  for (let field in data) {
    try {
      await valid(data, field, rules[field])
    } catch (e) {
      if (Array.isArray(e)) {
        errors.push(...e)
      }
    }
  }
  return errors.length ? errors : false
}

/*
 * Returns:
 * No invalid fields: returns false
 * Has invalid fields: returns an object containing all invalid fields, for example: {"email":"Email is required", "password":"Password is required"}
 */
export const getInvalidFields = async (data, rules) => {
  let arr = await validate(data, rules)
  if(!arr) {
    return false
  }
  let invalidFields = {}
  for(let f of arr) {
    invalidFields[f.field] = f.message
  }
  return invalidFields
}

export default validate
