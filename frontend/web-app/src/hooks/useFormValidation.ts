'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

interface FieldValidation {
  value: any;
  error: string | null;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
}

interface FormValidation {
  [key: string]: FieldValidation;
}

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  showErrors?: boolean;
  debounceMs?: number;
}

export const useFormValidation = (
  initialValues: { [key: string]: any },
  validationRules: { [key: string]: ValidationRule },
  options: UseFormValidationOptions = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    showErrors = true,
    debounceMs = 300,
  } = options;

  const [formState, setFormState] = useState<FormValidation>(() =>
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = {
        value: initialValues[key],
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false,
      };
      return acc;
    }, {} as FormValidation)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const debounceTimer = useRef<NodeJS.Timeout>();

  // Validation function
  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const rules = validationRules[fieldName];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [validationRules]);

  // Debounced validation
  const debouncedValidate = useCallback((fieldName: string, value: any) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const error = validateField(fieldName, value);
      setFormState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error,
          isValid: !error,
        },
      }));
    }, debounceMs);
  }, [validateField, debounceMs]);

  // Update field value
  const updateField = useCallback((fieldName: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value,
        isDirty: true,
      },
    }));

    if (validateOnChange) {
      debouncedValidate(fieldName, value);
    }
  }, [validateOnChange, debouncedValidate]);

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isTouched: true,
      },
    }));

    if (validateOnBlur) {
      const error = validateField(fieldName, formState[fieldName].value);
      setFormState(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          error,
          isValid: !error,
        },
      }));
    }
  }, [validateOnBlur, validateField, formState]);

  // Validate all fields
  const validateAll = useCallback(() => {
    const newFormState = { ...formState };
    let isValid = true;

    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, newFormState[fieldName].value);
      newFormState[fieldName] = {
        ...newFormState[fieldName],
        error,
        isValid: !error,
        isTouched: true,
      };
      if (error) isValid = false;
    });

    setFormState(newFormState);
    return isValid;
  }, [formState, validateField]);

  // Get field props for easy integration
  const getFieldProps = useCallback((fieldName: string) => {
    const field = formState[fieldName];
    return {
      value: field.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateField(fieldName, e.target.value);
      },
      onBlur: () => handleBlur(fieldName),
      error: showErrors && field.isTouched && field.error,
      isValid: field.isValid,
      isDirty: field.isDirty,
      isTouched: field.isTouched,
    };
  }, [formState, updateField, handleBlur, showErrors]);

  // Check if form is valid
  const isValid = useCallback(() => {
    return Object.values(formState).every(field => field.isValid);
  }, [formState]);

  // Get form values
  const getValues = useCallback(() => {
    return Object.keys(formState).reduce((acc, key) => {
      acc[key] = formState[key].value;
      return acc;
    }, {} as { [key: string]: any });
  }, [formState]);

  // Reset form
  const reset = useCallback((newValues?: { [key: string]: any }) => {
    const values = newValues || initialValues;
    setFormState(Object.keys(values).reduce((acc, key) => {
      acc[key] = {
        value: values[key],
        error: null,
        isValid: true,
        isDirty: false,
        isTouched: false,
      };
      return acc;
    }, {} as FormValidation));
    setSubmitAttempted(false);
  }, [initialValues]);

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName: string, value: any) => {
    updateField(fieldName, value);
  }, [updateField]);

  // Set field error programmatically
  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setFormState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        error,
        isValid: !error,
        isTouched: true,
      },
    }));
  }, []);

  // Submit handler wrapper
  const handleSubmit = useCallback(async (onSubmit: (values: { [key: string]: any }) => Promise<void> | void) => {
    setSubmitAttempted(true);
    
    if (!validateAll()) {
      return false;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(getValues());
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validateAll, getValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    formState,
    isSubmitting,
    submitAttempted,
    updateField,
    handleBlur,
    validateAll,
    getFieldProps,
    isValid: isValid(),
    getValues,
    reset,
    setFieldValue,
    setFieldError,
    handleSubmit,
  };
};

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    },
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value && value.length < 8) {
        return 'Password must be at least 8 characters long';
      }
      if (value && !/(?=.*[a-z])/.test(value)) {
        return 'Password must contain at least one lowercase letter';
      }
      if (value && !/(?=.*[A-Z])/.test(value)) {
        return 'Password must contain at least one uppercase letter';
      }
      if (value && !/(?=.*\d)/.test(value)) {
        return 'Password must contain at least one number';
      }
      return null;
    },
  },
  confirmPassword: (passwordField: string) => ({
    required: true,
    custom: (value: string, formValues: { [key: string]: any }) => {
      if (value !== formValues[passwordField]) {
        return 'Passwords do not match';
      }
      return null;
    },
  }),
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        return 'Name can only contain letters and spaces';
      }
      return null;
    },
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    custom: (value: string) => {
      if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number';
      }
      return null;
    },
  },
  url: {
    pattern: /^https?:\/\/.+\..+/,
    custom: (value: string) => {
      if (value && !/^https?:\/\/.+\..+/.test(value)) {
        return 'Please enter a valid URL';
      }
      return null;
    },
  },
};

// Hook for simple field validation
export const useFieldValidation = (initialValue: any, rules: ValidationRule) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const validate = useCallback((val: any): string | null => {
    // Required validation
    if (rules.required && (!val || (typeof val === 'string' && val.trim() === ''))) {
      return 'This field is required';
    }

    // Skip other validations if field is empty and not required
    if (!val || (typeof val === 'string' && val.trim() === '')) {
      return null;
    }

    // Min length validation
    if (rules.minLength && val.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && val.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(val)) {
      return 'Invalid format';
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(val);
      if (customError) {
        return customError;
      }
    }

    return null;
  }, [rules]);

  const handleChange = useCallback((newValue: any) => {
    setValue(newValue);
    setIsDirty(true);
    
    const validationError = validate(newValue);
    setError(validationError);
    setIsValid(!validationError);
  }, [validate]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    const validationError = validate(value);
    setError(validationError);
    setIsValid(!validationError);
  }, [validate, value]);

  return {
    value,
    error,
    isValid,
    isDirty,
    isTouched,
    setValue: handleChange,
    onBlur: handleBlur,
  };
};