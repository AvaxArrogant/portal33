"use client";

import { useState, useEffect, useCallback } from "react";
import Select from "react-select";

type Option = { value: string; label: string };

export default function SearchableDropdown({
  name,
  endpoint,
  placeholder,
  className,
  value,
  onChange,
  preselectedId,
}: {
  name: string;
  endpoint: string;
  placeholder?: string;
  className?: string;
  value?: Option | null;
  onChange?: (value: Option | null) => void;
  preselectedId?: string;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log(`Fetching options from ${endpoint}${endpoint.includes('?') ? '&' : '?'}forceRefresh=${Date.now()}`);
      const res = await fetch(`${endpoint}${endpoint.includes('?') ? '&' : '?'}forceRefresh=${Date.now()}`, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (!res.ok) {
        throw new Error(`API responded with status ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        console.warn('API did not return an array:', data);
        setOptions([]);
        return;
      }

      const formattedOptions = data.map((item: any) => ({
        value: item.id,
        label: item.name,
      }));
      
      console.log(`Loaded ${formattedOptions.length} options`, 
        preselectedId ? `(looking for ID: ${preselectedId})` : '');
      
      setOptions(formattedOptions);
      
      // If we have a preselected ID and no value is set yet, set it now
      if (preselectedId && !value && onChange && !initialLoadDone) {
        const selectedOption = formattedOptions.find(opt => opt.value === preselectedId);
        if (selectedOption) {
          console.log('Setting preselected option:', selectedOption);
          onChange(selectedOption);
        } else {
          console.warn(`Preselected ID ${preselectedId} not found in options`);
        }
      }
      
      setInitialLoadDone(true);
    } catch (error) {
      console.error("Failed to fetch options:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, onChange, preselectedId, value, initialLoadDone]);

  // Load options immediately on mount and when dropdown opens
  useEffect(() => {
    // Always load options on mount
    loadOptions();
    
    // Set up periodic refresh every 30 seconds when dropdown is open
    let refreshInterval: NodeJS.Timeout | null = null;
    
    if (isOpen) {
      refreshInterval = setInterval(loadOptions, 30000);
    }
    
    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [isOpen, loadOptions]);

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
      onMenuOpen={() => {
        setIsOpen(true);
        loadOptions(); // Refresh data when menu opens
      }}
      onMenuClose={() => setIsOpen(false)}
    />
  );
}