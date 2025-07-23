import React from 'react';
import { Mail } from 'lucide-react';

interface EmailInputProps {
    label?: string;
    placeholder?: string;
    className?: string;
    required?: boolean;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({ 
    label, 
    placeholder, 
    className = "", 
    required, 
    value, 
    onChange,
    error 
}) => {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
                {label && <label className="text-xs md:text-sm text-white font-semibold">{label}</label>}
                {required && <span className="text-[10px] md:text-xs text-red-400">*</span>}
            </div>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="email"
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder} 
                    className={`w-full py-2 px-4 pl-10 text-xs md:text-sm border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 ${
                        error 
                            ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                            : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
                    } ${className}`} 
                />
            </div>
            {error && (
                <span className="text-xs md:text-sm text-red-400 mt-0.5">{error}</span>
            )}
        </div>
    );
};

export default EmailInput;