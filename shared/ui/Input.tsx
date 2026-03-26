import React from 'react';
import { theme } from '../config/theme';

export type InputProps = React.ComponentProps<'input'> & {
  error?: boolean;
  success?: boolean;
  fullWidth?: boolean;
};

export const Input = ({ className = '', error, success, fullWidth = true, ...props }: InputProps) => {
  const base = theme.input.base;
  const statusClass = error ? theme.input.error : success ? theme.input.success : '';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <input 
      className={`${base} ${statusClass} ${widthClass} ${className}`}
      {...props} 
    />
  );
};

export type SelectProps = React.ComponentProps<'select'> & {
  error?: boolean;
  fullWidth?: boolean;
};

export const Select = ({ className = '', error, fullWidth = true, children, ...props }: SelectProps) => {
  const base = theme.input.base;
  const statusClass = error ? theme.input.error : '';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <select 
      className={`${base} ${statusClass} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </select>
  );
};