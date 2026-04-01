import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`min-h-screen transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[220px]'}`}>
        <Outlet />
      </div>
    </div>
  );
}
