import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  className, 
  padding = true,
  shadow = true,
  hover = false,
  ...props 
}) => {
  const cardClasses = clsx(
    'bg-white rounded-lg border border-gray-200',
    {
      'p-6': padding,
      'shadow-sm': shadow,
      'hover:shadow-md transition-shadow': hover
    },
    className
  );
  
  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => (
  <div className={clsx('border-b border-gray-200 pb-4 mb-4', className)} {...props}>
    {children}
  </div>
);

const CardBody = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className, ...props }) => (
  <div className={clsx('border-t border-gray-200 pt-4 mt-4', className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;