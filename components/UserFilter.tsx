"use client";

import React, { useState } from 'react';

type UserFilterProps = {
  onSearch: (term: string) => void;
  onRoleFilter: (role: string) => void;
  onStatusFilter: (status: string) => void;
  totalUsers: number;
};

export default function UserFilter({ 
  onSearch, 
  onRoleFilter, 
  onStatusFilter,
  totalUsers 
}: UserFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className="mb-4">
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h3 className="text-lg font-semibold mb-2 md:mb-0">
          {totalUsers} Total Users
        </h3>
        
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="field mr-2"
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <div>
          <label htmlFor="role-filter" className="mr-2 text-sm font-medium">Role:</label>
          <select 
            id="role-filter" 
            onChange={(e) => onRoleFilter(e.target.value)}
            className="field-sm"
          >
            <option value="">All Roles</option>
            <option value="customer">Customers</option>
            <option value="admin">Admins</option>
            <option value="subadmin">Subadmins</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="status-filter" className="mr-2 text-sm font-medium">Status:</label>
          <select 
            id="status-filter" 
            onChange={(e) => onStatusFilter(e.target.value)}
            className="field-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}
