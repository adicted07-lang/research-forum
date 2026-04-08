"use client";

interface FilterSelectProps {
  options: string[];
  value: string;
  placeholder: string;
  paramName: string;
  baseParams: Record<string, string | undefined>;
  basePath?: string;
  className?: string;
}

export function FilterSelect({ options, value, placeholder, paramName, baseParams, basePath = "/forum", className }: FilterSelectProps) {
  function navigate(val: string) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(baseParams)) {
      if (v && k !== paramName) params.set(k, v);
    }
    if (val) params.set(paramName, val);
    const qs = params.toString();
    window.location.href = `${basePath}${qs ? `?${qs}` : ""}`;
  }

  return (
    <select
      onChange={(e) => navigate(e.target.value)}
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
