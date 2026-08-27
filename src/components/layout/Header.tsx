import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronDown, LogOut, Repeat2, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { deptOf, orgOf, todoCountOf, useApp } from '../../store';
import { DEMO_ORG_ID, VENDOR_ORG_ID } from '../../domain/seed';
import { can } from '../../domain/permissions';
import { roleLabels, type Role } from '../../domain/types';

interface HeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  /** Show the centred global search. Dashboard-style pages opt in. */
  search?: boolean;
}

/** Identities offered by the switcher, one per role for walkthroughs. */
const switchableRoles: Role[] = ['MEMBER', 'DEPT_ADMIN', 'ORG_ADMIN', 'VENDOR_OPS'];

export default function Header({ title, subtitle, actions, search }: HeaderProps) {
  const { state, me, myOrg, myDept, dispatch } = useApp();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !open) return;
      setOpen(false);
      // Return focus to the control that opened the panel, so keyboard users
      // are never dropped back onto the page body.
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const todo = todoCountOf(state, me);

  // One representative account per role so every perspective is reachable.
  // Pinned to the demo customer and the vendor, so seat holders seeded for the
  // other customer organizations never show up here.
  const identities = switchableRoles
    .map((role) =>
      state.members.find(
        (m) =>
          m.role === role &&
          m.status === '在职' &&
          (m.orgId === DEMO_ORG_ID || m.orgId === VENDOR_ORG_ID),
      ),
    )
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  /* Search jumps to the module catalogue with the term applied — the only
     place in this product where free-text search has meaning. */
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/modules?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="app-bar shrink-0 px-7 pt-6 pb-4 flex items-center justify-between gap-5">
      <div className="min-w-0">
        <h1 className="text-[26px] font-extrabold text-text leading-[1.12] tracking-[-0.035em]">{title}</h1>
        <p className="text-[13px] text-text-muted leading-tight mt-[5px] truncate">{subtitle}</p>
      </div>

      {search && can(me.role, 'module:browse') && (
        <form onSubmit={submitSearch} className="hidden lg:block flex-1 max-w-[420px]" role="search">
          <div className="relative group">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-placeholder group-focus-within:text-primary transition-colors pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索模块…"
              aria-label="搜索模块"
              className="w-full h-11 pl-11 pr-4 rounded-full bg-surface text-[13.5px] placeholder:text-text-placeholder border border-border focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-ring)] focus:outline-none transition-all"
            />
          </div>
        </form>
      )}

      <div className="flex items-center gap-2.5 shrink-0">
        {actions}

        {/* Controls sit on the shell tint, so they carry a white fill and a
            hairline to read as controls rather than dissolving into it. */}
        <button aria-label={`待办 ${todo} 项`} title={`待办 ${todo} 项`}
          className="relative w-11 h-11 rounded-full bg-surface border border-border text-text-secondary flex items-center justify-center cursor-pointer transition-colors hover:text-text">
          <Bell size={18} />
          {todo > 0 && (
            <span className="absolute top-[6px] right-[6px] min-w-[17px] h-[17px] px-[4px] rounded-full bg-danger text-white text-[12px] font-bold flex items-center justify-center ring-2 ring-white">
              {todo}
            </span>
          )}
        </button>

        <div className="relative" ref={ref}>
          {/* The whole identity control is one pill, matching button language. */}
          <button ref={triggerRef} onClick={() => setOpen(!open)}
            aria-label="账号与身份"
            aria-haspopup="menu"
            aria-expanded={open}
            className={`flex items-center gap-2.5 h-[44px] pl-4 pr-2 rounded-full cursor-pointer transition-colors border border-border ${
              open ? 'bg-surface-hover' : 'bg-surface hover:bg-surface-secondary'
            }`}>
            <div className="text-right hidden sm:block">
              <p className="text-[13.5px] font-bold text-text leading-tight">{me.name}</p>
              <p className="text-[12px] text-text-muted leading-tight mt-[2px]">
                {roleLabels[me.role]}
                {myDept ? ` · ${myDept.name}` : ''}
              </p>
            </div>
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white text-[13.5px] font-bold shrink-0"
              style={{ background: me.avatarColor }}>
              {me.name.charAt(0)}
            </div>
            <ChevronDown size={14} className={`text-text-placeholder transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="panel-floating absolute right-0 top-full mt-2 w-[308px] z-50 overflow-hidden rise">
              <div className="px-4 py-[13px] border-b border-hairline">
                <p className="text-[14px] font-bold text-text">{me.name} · {me.title}</p>
                <p className="text-[13px] text-text-muted mt-[3px] truncate">{myOrg.name}</p>
              </div>

              {/* Walkthrough aid, not a product feature: no real deployment lets a
                  member assume another role. Tinted and fenced off by a dashed
                  rule so it never reads as part of the account menu above. */}
              <div className="bg-surface-secondary border-t border-dashed border-border" role="group" aria-label="演示用身份切换">
                {/* Walkthrough affordance, intentionally quiet: no badge, no
                    disclaimer paragraph — the eyebrow label is enough. */}
                <div className="px-4 pt-3 pb-1.5 flex items-center gap-[6px]">
                  <Repeat2 size={13} className="text-text-placeholder" />
                  <span className="eyebrow">切换身份</span>
                </div>

                <div className="px-2 pb-2 flex flex-col gap-0.5">
                  {identities.map((m) => {
                    const active = m.id === me.id;
                    const org = orgOf(state, m.orgId);
                    const dept = deptOf(state, m.deptId);
                    return (
                      <button key={m.id}
                        onClick={() => { dispatch({ type: 'SWITCH_IDENTITY', memberId: m.id }); setOpen(false); }}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          active ? 'bg-primary-bg' : 'hover:bg-surface'
                        }`}>
                        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-white text-[13px] font-semibold shrink-0"
                          style={{ background: m.avatarColor }}>
                          {m.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-[13.5px] leading-tight font-semibold ${active ? 'text-primary-dark' : 'text-text'}`}>
                            {roleLabels[m.role]}
                          </p>
                          <p className="text-[12px] text-text-muted leading-tight mt-[2px] truncate">
                            {m.name} · {dept ? dept.name : org?.shortName}
                          </p>
                        </div>
                        {active && <Check size={15} className="text-primary shrink-0" strokeWidth={2.6} />}
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Session exit — RequireAuth redirects to /login the moment
                  `authed` flips, so no navigation call is needed here. */}
              <div className="px-2 py-2 border-t border-hairline bg-surface">
                <button
                  onClick={() => { setOpen(false); dispatch({ type: 'LOGOUT' }); }}
                  className="w-full flex items-center gap-2.5 px-2.5 h-[38px] rounded-lg text-left text-[13.5px] font-semibold text-danger hover:bg-danger-bg transition-colors cursor-pointer"
                >
                  <LogOut size={15} strokeWidth={2.2} className="shrink-0" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
