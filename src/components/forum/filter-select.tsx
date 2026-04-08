"use client";

interface FilterSelectProps {
  options: string[];
  value: string;
  placeholder: string;
  buildUrl: (value: string) => string;
  className?: string;
}

export function FilterSelect({ options, value, placeholder, buildUrl, className }: FilterSelectProps) {
  return (
    <select
      onChange={(e) => {
        window.location.href = buildUrl(e.target.value);
      }}
      value={value}
      className={className}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
