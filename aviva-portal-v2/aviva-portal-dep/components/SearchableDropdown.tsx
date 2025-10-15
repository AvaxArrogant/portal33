"use client";

import { useState, useEffect } from "react";
import Select from "react-select";

export default function SearchableDropdown({
  name,
  endpoint,
  placeholder,
  className,
  value,
  onChange,
}: {
  name: string;
  endpoint: string;
  placeholder?: string;
  className?: string;
  value?: any;
  onChange?: (value: any) => void;
}) {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        const formattedOptions = data.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
        setOptions(formattedOptions);
      } catch (error) {
        console.error("Failed to fetch options:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [endpoint, isOpen]);

  return (
    <Select
      name={name}
      options={options}
      isLoading={isLoading}
      placeholder={placeholder}
      className={className}
      classNamePrefix="react-select"
      value={value}
      onChange={onChange}
      onMenuOpen={() => setIsOpen(true)}
    />
  );
}