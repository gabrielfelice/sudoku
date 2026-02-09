"use client";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex items-center gap-2 px-3 py-2 rounded-lg
        font-semibold text-sm transition-all duration-200
        ${
          checked
            ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-yellow-400"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <span className="relative flex items-center">
        <span
          className={`
            block w-10 h-5 rounded-full transition-colors duration-200
            ${checked ? "bg-yellow-800" : "bg-gray-400"}
          `}
        >
          <span
            className={`
              block w-4 h-4 rounded-full bg-white shadow-md
              transform transition-transform duration-200 mt-0.5
              ${checked ? "translate-x-5 ml-0.5" : "translate-x-0.5"}
            `}
          />
        </span>
      </span>
      <span>{label}</span>
    </button>
  );
}
