import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { canAny, type Permission } from '../../domain/permissions';
import { roleLabels } from '../../domain/types';
import { useApp } from '../../store';

/**
 * Route-level gate. Renders an explicit refusal instead of redirecting so the
 * permission boundary is visible when walking through roles.
 */
export default function RequirePermission({
  permissions,
  children,
}: {
  permissions: Permission[];
  children: ReactNode;
}) {
  const { me } = useApp();
  const navigate = useNavigate();

  if (canAny(me.role, permissions)) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="panel-floating px-10 py-12 text-center max-w-[460px] rise">
        <div className="w-[60px] h-[60px] rounded-2xl bg-warning-bg flex items-center justify-center mx-auto mb-5 ring-1 ring-inset ring-warning/15">
          <ShieldAlert size={27} className="text-warning" strokeWidth={2.1} />
        </div>
        <p className="text-[16px] font-bold text-text tracking-[-0.01em]">当前角色无权访问该页面</p>
        <p className="text-[13.5px] text-text-muted mt-3 leading-relaxed">
          你正以「{roleLabels[me.role]}」身份登录。该页面仅对具备相应权限的角色开放，
          可在右上角切换身份后再访问。
        </p>
        <button onClick={() => navigate('/')}
          className="btn-primary mt-6 h-[38px] px-6 text-[13.5px] font-semibold cursor-pointer">
          返回工作台
        </button>
      </div>
    </div>
  );
}
