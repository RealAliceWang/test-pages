import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export type UserRole = 'user' | 'admin';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<UserRole>('user');

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} role={role} />
      <div className={`min-h-screen transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[220px]'}`}>
        <Outlet context={{ role, setRole }} />
      </div>
    </div>
  );
}
