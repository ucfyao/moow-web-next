'use client';

import { createContext, useContext } from 'react';

export interface AdminRole {
  _id: string;
  role_name: string;
  role_description: string;
}

export interface AdminResource {
  _id: string;
  resource_code: string;
  resource_name: string;
  resource_type: string;
  resource_url: string;
  resource_pid: string | null;
}

export interface Permission {
  role: AdminRole | null;
  resources: AdminResource[];
}

export interface AdminContextType {
  permission: Permission;
  hasPermission: (code: string) => boolean;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function useAdmin(): AdminContextType {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export { AdminContext };
