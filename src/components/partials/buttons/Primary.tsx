import React from 'react';

interface PrimaryButtonProps {
    label: string;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
    label, 
    className = "", 
    onClick,
    disabled = false,
    loading = false,
    type = 'button'
}) => {
    return (
        <button 
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-8 rounded-xl font-bold text-sm transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-4 focus:ring-blue-400/50 ${className}`}
        >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                </div>
            ) : (
                label
            )}
        </button>
    );
};

export default PrimaryButton;