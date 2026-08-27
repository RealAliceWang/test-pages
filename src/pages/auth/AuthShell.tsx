import type { ReactNode } from 'react';
import { useApp } from '../../store';

/**
 * Full-viewport chrome for /login and /register: the product's ambient shell
 * without the sidebar or task rail, one white panel floating in the middle.
 * FlashToast lives inside the app Layout, so auth pages surface reducer
 * errors themselves through the inline banner below.
 */
export default function AuthShell({ width = 440, children }: { width?: number; children: ReactNode }) {
  const { state, dispatch } = useApp();
  const flash = state.flash;

  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-6">
      <div className="w-full" style={{ maxWidth: width }}>
        {/* Brand above the panel — a single stacked lockup. Two segments with
            a divider read like a 登录/注册 tab pair in this position, so the
            product name sits under the logotype instead of beside it. */}
        <div className="flex flex-col items-center gap-1 mb-6 select-none">
          <span className="text-[26px] font-extrabold tracking-[-0.035em] text-text leading-none">3D3S</span>
          <span className="text-[13px] text-text-muted tracking-[0.22em] ml-[0.22em]">云授权系统</span>
        </div>

        <div className="panel px-8 py-8">
          {flash && flash.kind === 'error' && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 rounded-sm bg-danger-bg text-danger text-[13px] font-medium leading-relaxed cursor-pointer"
              onClick={() => dispatch({ type: 'DISMISS_FLASH' })}
              title="点击关闭"
            >
              {flash.text}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
