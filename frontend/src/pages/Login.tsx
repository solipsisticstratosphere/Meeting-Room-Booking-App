import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/authSlice';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../utils/errorUtils';
import { PasswordInput } from '../components/PasswordInput';
import type { LoginCredentials } from '../types';

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const passwordValue = watch('password');

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      dispatch(setCredentials({ user: response.user, token: response.token }));
      toast.success('Login successful!');
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
              Sign in to your account
            </h2>
            <p className="text-center text-sm text-gray-600">
              Or{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                create a new account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-5">
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
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isLoading} 
                className="btn-primary w-full py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
