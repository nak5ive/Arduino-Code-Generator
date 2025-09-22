
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        flex items-center justify-center px-6 py-3
        bg-blue-600 text-white font-semibold rounded-lg shadow-md
        hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500
        disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-70
        transition-all duration-200 ease-in-out
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
