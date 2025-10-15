"use client";

import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DatePicker({
  name,
  value,
  onChange,
  className,
}: {
  name: string;
  value: string;
  onChange: (date: string) => void;
  className?: string;
}) {
  const [startDate, setStartDate] = useState(value ? new Date(value) : null);

  const handleChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      onChange(date.toISOString().split("T")[0]);
    }
  };

  return (
    <ReactDatePicker
      name={name}
      selected={startDate}
      onChange={handleChange}
      className={className}
      dateFormat="yyyy-MM-dd"
    />
  );
}