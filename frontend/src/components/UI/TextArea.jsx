import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const TextArea = forwardRef(({
  label,
  error,
  hint,
  className,
  containerClassName,
  ...props
}, ref) => {
  const textAreaClasses = clsx(
    'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500',
    'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    'resize-none',
    {
      'border-red-300 focus:border-red-500 focus:ring-red-500': error
    },
    className
  );
  
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={textAreaClasses}
        {...props}
      />
      
      {hint && !error && (
        <p className="mt-1 text-sm text-gray-500">{hint}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;
