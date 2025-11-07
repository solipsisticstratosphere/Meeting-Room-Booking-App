import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errorUtils';
import { PasswordInput } from '../components/PasswordInput';
import type { RegisterCredentials } from '../types';

interface RegisterFormData extends RegisterCredentials {
  confirmPassword: string;
}

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();

  const passwordValue = watch('password');
  const confirmPasswordValue = watch('confirmPassword');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      const response = await authApi.register(registerData);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      toast.success('Registration successful!');
      navigate('/rooms');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card shadow-xl">
          <div className="mb-8">
            <h2 className="text-center text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                sign in to existing account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className="input"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="error-message">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}
              </div>

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                register={register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                value={passwordValue}
                error={errors.password?.message}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                register={register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === passwordValue || 'Passwords do not match',
                })}
                value={confirmPasswordValue}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="btn-primary w-full py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
