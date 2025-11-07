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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
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
                placeholder="Email address"
              />
              {errors.email && <p className="error-message">{errors.email.message}</p>}
            </div>

            <PasswordInput
              label="Password"
              placeholder="Password"
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
            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
