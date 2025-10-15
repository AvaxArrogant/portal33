"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import UserFilter from './UserFilter';

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    role?: string;
    status?: string;
    name?: string;
    [key: string]: any;
  };
  profile?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    first_name?: string;
    last_name?: string;
    address?: string;
    dob?: string;
    [key: string]: any;
  } | null;
  policyCount: number;
};

type UserListClientProps = {
  initialUsers: UserRow[];
};

export default function UserListClient({ initialUsers }: UserListClientProps) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(term) || 
        (user.profile?.name || user.user_metadata?.name || '')
          .toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (roleFilter) {
      result = result.filter(user => 
        (user.profile?.role || user.user_metadata?.role) === roleFilter
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(user => 
        user.user_metadata?.status === statusFilter
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  return (
    <>
      <UserFilter 
        onSearch={handleSearch}
        onRoleFilter={handleRoleFilter}
        onStatusFilter={handleStatusFilter}
        totalUsers={users.length}
      />
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-ink-500 bg-gray-50">
            <tr>
              <th className="py-3 px-4 font-semibold">User Info</th>
              <th className="py-3 px-4 font-semibold">Contact</th>
              <th className="py-3 px-4 font-semibold">Role</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold">Policies</th>
              <th className="py-3 px-4 font-semibold">Created</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">
                  No users match your filters
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const profile = user.profile || {};
                const profileData = user.profile || { name: '', role: '', phone: '' };
                const fullName = profileData.name || user.user_metadata?.name || '';
                const isCustomer = (profileData.role || user.user_metadata?.role) === 'customer';
                
                return (
                  <tr key={user.id} className="border-t border-ink-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{fullName || 'Unknown'}</span>
                        <span className="text-gray-500 text-xs">{user.id.substring(0, 8)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        {profileData.phone && <span className="text-gray-500 text-xs">{profileData.phone}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={
                        (profileData.role || user.user_metadata?.role) === 'admin' ? 'purple' : 
                        (profileData.role || user.user_metadata?.role) === 'subadmin' ? 'blue' : 'green'
                      } size="sm">
                        {profileData.role || user.user_metadata?.role || 'customer'}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge variant={
                        user.user_metadata?.status === 'active' ? 'success' : 
                        user.user_metadata?.status === 'pending' ? 'warning' : 'danger'
                      } size="sm">
                        {user.user_metadata?.status || 'pending'}
                      </StatusBadge>
                    </td>
                    <td className="py-3 px-4">
                      {isCustomer ? (
                        <Link href={`/admin/policies?customer=${user.id}`} className="text-blue-600 hover:underline">
                          {user.policyCount} {user.policyCount === 1 ? 'policy' : 'policies'}
                        </Link>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span title={new Date(user.created_at).toLocaleString("en-GB")}>
                        {new Date(user.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/users/${user.id}`} className="btn btn-sm btn-outline">
                          Manage
                        </Link>
                        {isCustomer && user.policyCount === 0 && (
                          <Link href={`/admin/policies/create?customer=${user.id}`} className="btn btn-sm btn-gold">
                            Create Policy
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
