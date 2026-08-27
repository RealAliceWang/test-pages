import { useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import FlashToast from '../common/FlashToast';
import { AsideSlotContext } from './asideSlot';

/**
 * The app fills the viewport edge to edge.
 *
 * Three columns: icon rail, tinted working area, and an optional white side
 * rail. Pages opt into the side rail by calling useAside(); when nothing is
 * registered the working area simply spans the full width, so table pages are
 * unaffected.
 *
 * Each column scrolls independently, so the rail stays put and the side rail's
 * queue never scrolls away with the dashboard.
 */
export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [aside, setAside] = useState<ReactNode>(null);
  const { pathname } = useLocation();

  return (
    <div className="h-dvh">
      <div className="app-shell h-full flex overflow-hidden">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        <AsideSlotContext.Provider value={setAside}>
          {/* min-w-0 lets wide tables shrink instead of pushing the shell open */}
          <main className="flex-1 min-w-0 overflow-y-auto">
            {/* Keyed by route so each page fades up on entry */}
            <div key={pathname} className="rise">
              <Outlet />
            </div>
          </main>

          {aside && (
            <aside className="app-aside hidden xl:flex w-[336px] shrink-0 flex-col overflow-y-auto">
              {aside}
            </aside>
          )}
        </AsideSlotContext.Provider>
      </div>
      <FlashToast />
    </div>
  );
}
