import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface PasswordInputProps {
  label: string;
  placeholder?: string;
  error?: string;
  register: UseFormRegisterReturn;
  value?: string;
}

export const PasswordInput = ({
  label,
  placeholder = 'Enter password',
  error,
  register,
  value,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          {...register}
          type={showPassword ? 'text' : 'password'}
          className="input pr-10"
          placeholder={placeholder}
        />
        {value && value.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};
