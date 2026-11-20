import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  variant?: "default" | "theme";
}

export function ToggleSwitch({ checked, onChange, disabled = false, id, variant = "default" }: ToggleSwitchProps) {
  return (
    <div
      id={id}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-8 w-[72px] items-center rounded-full cursor-pointer transition-colors duration-300 select-none shadow-inner ${
        checked ? 'bg-[#15c35a]' : 'bg-[#a3a3a3]'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* ON Text */}
      <span
        className={`absolute left-2.5 text-[11px] font-extrabold tracking-wide text-white transition-opacity duration-300 ${
          checked ? 'opacity-100' : 'opacity-0'
        }`}
      >
        ON
      </span>
      
      {/* OFF Text */}
      <span
        className={`absolute right-2 text-[11px] font-extrabold tracking-wide text-white transition-opacity duration-300 ${
          checked ? 'opacity-0' : 'opacity-100'
        }`}
      >
        OFF
      </span>

      {/* Slider Knob */}
      <span
        className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full shadow-md transition duration-300 ease-in-out ${
          checked ? 'translate-x-11 bg-white' : 'translate-x-1 bg-white'
        }`}
      >
        {variant === "theme" && (
          checked ? (
            <Moon size={14} className="text-gray-800" />
          ) : (
            <Sun size={14} className="text-yellow-500" />
          )
        )}
      </span>
    </div>
  );
}
