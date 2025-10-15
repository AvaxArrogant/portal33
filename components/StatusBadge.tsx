"use client";

import React from 'react';

type StatusBadgeProps = {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "purple" | "blue" | "green" | "default";
  size?: "sm" | "md" | "lg";
};

export default function StatusBadge({ 
  children, 
  variant = "default",
  size = "md"
}: StatusBadgeProps) {
  // Color mapping for different variants
  const colorMap = {
    primary: "bg-blue-100 text-blue-800 border-blue-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    danger: "bg-red-100 text-red-800 border-red-200",
    info: "bg-cyan-100 text-cyan-800 border-cyan-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    default: "bg-gray-100 text-gray-800 border-gray-200"
  };

  // Size mapping
  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-0.75",
    lg: "text-base px-3 py-1"
  };

  return (
    <span className={`
      inline-flex items-center rounded-full 
      font-medium border 
      ${colorMap[variant]} 
      ${sizeMap[size]}
    `}>
      {children}
    </span>
  );
}
