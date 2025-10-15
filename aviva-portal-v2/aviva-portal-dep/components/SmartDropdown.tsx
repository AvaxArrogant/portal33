"use client";

import { useState } from "react";

export default function SmartDropdown({
  name,
  options,
  className,
}: {
  name: string;
  options: string[];
  className?: string;
}) {
  const [value, setValue] = useState(options[0] || "");
  const [isCustom, setIsCustom] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "custom") {
      setIsCustom(true);
      setValue("");
    } else {
      setIsCustom(false);
      setValue(selectedValue);
    }
  };

  return (
    <div className="relative">
      {isCustom ? (
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={className}
          autoFocus
        />
      ) : (
        <select name={name} value={value} onChange={handleChange} className={className}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="custom">Custom...</option>
        </select>
      )}
    </div>
  );
}