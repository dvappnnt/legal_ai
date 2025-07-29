import React from 'react';

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center aspect-square w-full max-w-[100px] sm:max-w-[120px] md:max-w-[140px] p-2 sm:p-4 rounded-xl text-center ${className}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <span className="mt-2 text-xs sm:text-sm font-medium break-words text-center">
        {label}
      </span>
    </button>
  );
};

export default IconButton;
