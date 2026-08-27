import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, BadgeCheck, Box, Building2, CalendarDays, Check, ChevronRight, Clock,
  Factory, Hash, KeyRound, Layers, LogIn, Mail, MapPin, Monitor, Pencil, Phone, Shield,
  UserCog, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import type { MetricTone } from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import { can } from '../domain/permissions';
import { roleLabels } from '../domain/types';
import {
  addDays,
  assignmentsOfMember,
  daysBetween,
  memberOf,
  moduleOf,
  poolOf,
  seatStatusOf,
  useApp,
  type SeatStatus,
} from '../store';

interface FieldProps {
  label: string;
  icon: ReactNode;
  iconCls: string;
  children: ReactNode;
  /** Fields the member cannot change here, only through their org admin. */
  hint?: string;
}

function Field({ label, icon, iconCls, children, hint }: FieldProps) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-[42px] h-[42px] rounded-md flex items-center justify-center shrink-0 ${iconCls}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[13px] text-text-muted">{label}</p>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {children}
          {hint && (
            <span title={hint} className="w-[20px] h-[20px] rounded-sm flex items-center justify-center bg-surface-secondary">
              <Pencil size={11} className="text-text-muted" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { state, me, myOrg, myDept } = useApp();

  const manager = myDept ? memberOf(state, myDept.managerId) : undefined;

  const seats = useMemo(
    () =>
      assignmentsOfMember(state, me.id).flatMap((a) => {
        const module = moduleOf(state, a.moduleId);
        const pool = poolOf(state, a.orgId, a.moduleId);
        if (!module || !pool) return [];

        const total = Math.max(1, daysBetween(pool.startDate, pool.expireDate));
        const remain = daysBetween(state.now, pool.expireDate);
        const status = seatStatusOf(state, a);
        const expired = status === '已过期';

        return [
          {
            id: a.id,
            module,
            status,
            remainDays: Math.max(0, remain),
            pct: Math.min(100, Math.max(0, Math.round(((expired ? total : total - Math.max(0, remain)) / total) * 100))),
          },
        ];
      }),
    [state, me.id],
  );

  const countOf = (s: SeatStatus) => seats.filter((x) => x.status === s).length;

  const securityItems = [
    { icon: <KeyRound size={14} />, label: '登录密码', done: me.status !== '待激活' },
    { icon: <Phone size={14} />, label: '手机绑定', done: Boolean(me.phone) },
    { icon: <Mail size={14} />, label: '邮箱绑定', done: Boolean(me.email) },
  ];
  const doneCount = securityItems.filter((i) => i.done).length;
  const securityPct = Math.round((doneCount / securityItems.length) * 100);
  const securityLevel = doneCount === 3 ? '优秀' : doneCount === 2 ? '良好' : '待完善';
  const securityTone = doneCount === 3 ? 'text-success' : doneCount === 2 ? 'text-warning' : 'text-danger';
  const securityStroke =
    doneCount === 3 ? 'var(--color-success)' : doneCount === 2 ? 'var(--color-warning)' : 'var(--color-danger)';

  // Login history is derived from the real last login so every identity stays consistent.
  const loginIp = me.role === 'VENDOR_OPS' ? '58.246.***.12' : '192.168.100.42';
  const logins =
    me.lastLogin === '—'
      ? []
      : [
          { time: me.lastLogin, device: 'Chrome 124 / macOS', current: true },
          { time: `${addDays(me.lastLogin, -1)} 18:20`, device: 'Chrome 124 / Windows', current: false },
          { time: `${addDays(me.lastLogin, -3)} 09:05`, device: 'Safari / iPadOS', current: false },
        ];

  const seatStats: { status: SeatStatus; icon: LucideIcon; tone: MetricTone }[] = [
    { status: '生效中', icon: Box, tone: 'accent' },
    { status: '即将到期', icon: AlertTriangle, tone: 'attention' },
    { status: '已过期', icon: Clock, tone: 'neutral' },
  ];

  return (
    <div>
      <Header title="个人信息" subtitle="查看企业成员身份、组织归属与持有的模块席位" />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {/* Identity — the page's focal point, so it carries the ink surface */}
        <div className="panel overflow-hidden">
          <div className="panel-ink rounded-none px-7 py-7 flex items-center gap-5">
            <div
              className="relative w-[76px] h-[76px] rounded-full flex items-center justify-center text-white text-[27px] font-bold shrink-0 ring-2 ring-white/20"
              style={{ background: me.avatarColor }}
            >
              {me.name.charAt(0)}
            </div>
            <div className="relative min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-[22px] font-extrabold text-white tracking-[-0.02em]">{me.name}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full bg-white/12 text-[12.5px] font-semibold text-white/85">
                  <Shield size={12} /> {roleLabels[me.role]}
                </span>
                <StatusBadge status={me.status} />
              </div>
              <p className="text-[14px] text-white/70 mt-2">{me.title}</p>
              <p className="text-[13px] text-white/45 mt-1">
                {myOrg.shortName}
                {myDept ? ` · ${myDept.name}` : ''}
              </p>
            </div>
          </div>

          <div className="px-6 py-5 grid grid-cols-3 gap-6">
            <Field label="工号" icon={<Hash size={20} className="text-primary" />} iconCls="bg-primary-bg">
              <p className="text-[14px] text-text">{me.employeeNo}</p>
            </Field>
            <Field label="入职时间" icon={<CalendarDays size={20} className="text-success" />} iconCls="bg-success-bg">
              <p className="text-[14px] text-text">{me.joinedAt}</p>
            </Field>
            <Field label="最后登录" icon={<Clock size={20} className="text-warning" />} iconCls="bg-warning-bg">
              <p className="text-[14px] text-text">{me.lastLogin}</p>
            </Field>
          </div>
        </div>

        {/* Organization and contact */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 panel px-6 py-5">
            <h2 className="text-[16px] font-bold text-text mb-5">组织归属</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label="所属企业" icon={<Building2 size={20} className="text-primary" />} iconCls="bg-primary-bg">
                <p className="text-[14px] text-text leading-[20px]">{myOrg.name}</p>
                <StatusBadge status={myOrg.verified ? '已认证' : '未认证'} />
              </Field>
              <Field label="企业编号" icon={<BadgeCheck size={20} className="text-success" />} iconCls="bg-success-bg">
                <p className="text-[14px] text-text">{myOrg.code}</p>
              </Field>

              {myDept ? (
                <>
                  <Field label="所属部门" icon={<Users size={20} className="text-primary" />} iconCls="bg-primary-bg">
                    <p className="text-[14px] text-text">
                      {myDept.name} · {myDept.code}
                    </p>
                  </Field>
                  <Field label="部门负责人" icon={<UserCog size={20} className="text-warning" />} iconCls="bg-warning-bg">
                    <p className="text-[14px] text-text">
                      {manager ? `${manager.name} · ${manager.title}` : '暂未指定'}
                    </p>
                  </Field>
                </>
              ) : (
                <div className="col-span-2 rounded-md bg-surface-secondary px-4 py-3 text-[13px] text-text-secondary leading-[20px]">
                  当前账号为厂商侧运营账号，直属厂商，不隶属于任何客户企业部门。
                </div>
              )}

              <Field label="企业规模" icon={<Layers size={20} className="text-text-secondary" />} iconCls="bg-surface-hover">
                <p className="text-[14px] text-text">{myOrg.scale}</p>
              </Field>
              <Field label="所属行业" icon={<Factory size={20} className="text-text-secondary" />} iconCls="bg-surface-hover">
                <p className="text-[14px] text-text">{myOrg.industry}</p>
              </Field>
            </div>
          </div>

          <div className="col-span-2 panel px-6 py-5">
            <h2 className="text-[16px] font-bold text-text mb-5">联系方式</h2>
            <div className="flex flex-col gap-5">
              <Field
                label="邮箱"
                icon={<Mail size={20} className="text-primary" />}
                iconCls="bg-primary-bg"
                hint="如需修改请联系企业管理员"
              >
                <p className="text-[14px] text-text truncate">{me.email}</p>
              </Field>
              <Field
                label="手机号"
                icon={<Phone size={20} className="text-success" />}
                iconCls="bg-success-bg"
                hint="如需修改请联系企业管理员"
              >
                <p className="text-[14px] text-text">{me.phone}</p>
              </Field>
              <Field label="企业对接人" icon={<Users size={20} className="text-text-secondary" />} iconCls="bg-surface-hover">
                <p className="text-[14px] text-text">
                  {myOrg.contactName} · {myOrg.contactPhone}
                </p>
              </Field>
            </div>
          </div>
        </div>

        {/* Seats, security and login history */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 panel px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13.5px] font-bold text-text tracking-[-0.01em]">
                我的授权概览
                <span className="ml-2 text-[13px] font-normal text-text-muted">共 {seats.length} 个席位</span>
              </h2>
              {can(me.role, 'assignment:view-own') && (
                <Link to="/my-modules" className="text-[14px] text-primary hover:underline inline-flex items-center gap-1">
                  查看全部 <ChevronRight size={14} />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {seatStats.map((s) => (
                <div key={s.status} className="panel-inset px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`w-[36px] h-[36px] rounded-full flex items-center justify-center shrink-0 ${
                      s.tone === 'accent' ? 'bg-primary-bg text-primary'
                        : s.tone === 'attention' ? 'bg-warning-bg text-warning'
                          : 'bg-surface-hover text-text-secondary'
                    }`}>
                      <s.icon size={18} strokeWidth={2.1} />
                    </span>
                    <div>
                      <p className="display-num text-[22px] text-text">{countOf(s.status)}</p>
                      <p className="text-[12px] mt-1.5 text-text-muted font-medium">{s.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-divider">
              <p className="text-[13px] text-text-muted mb-3">持有的模块席位</p>
              {seats.length === 0 ? (
                <div className="rounded-md bg-surface-secondary px-4 py-5 text-center">
                  <p className="text-[14px] text-text-muted">当前账号未持有企业席位</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {seats.slice(0, 4).map((s) => (
                    <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-surface-secondary">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[13px] font-medium text-text truncate">
                            {s.module.name}
                            <span className="ml-1.5 text-[12px] font-normal text-text-muted">{s.module.edition}</span>
                          </span>
                          <span className="text-[12px] text-text-muted shrink-0">
                            {s.status === '已过期' ? '已过期' : s.status === '已暂停' ? '已暂停' : `剩余 ${s.remainDays} 天`}
                          </span>
                        </div>
                        {/* Shared meter, so term progress reads the same here as
                            on the authorisation and seat pool pages. */}
                        <div className="meter mt-1.5">
                          <span
                            style={{
                              width: `${s.pct}%`,
                              background:
                                s.status === '已过期'
                                  ? 'var(--color-text-placeholder)'
                                  : s.status === '已暂停'
                                    ? 'var(--color-danger-light)'
                                    : s.status === '即将到期'
                                    ? 'var(--color-warning-light)'
                                    : 'var(--color-signal)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-4">
            <div className="panel px-6 py-5">
              <h2 className="text-[16px] font-bold text-text mb-4">账户安全</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-[56px] h-[56px]">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="24" fill="none" stroke="var(--color-divider)" strokeWidth="5" />
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke={securityStroke}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 24}
                      strokeDashoffset={2 * Math.PI * 24 * (1 - securityPct / 100)}
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield size={18} className={securityTone} />
                  </div>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text">
                    安全等级：<span className={securityTone}>{securityLevel}</span>
                  </p>
                  <p className="text-[12px] text-text-muted mt-1">已完成 {securityPct}% 的安全设置</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {securityItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2.5 text-[13px] text-text-secondary">
                      <span className="text-text-muted">{item.icon}</span>
                      {item.label}
                    </div>
                    {item.done ? (
                      <span className="text-[12px] text-success flex items-center gap-1">
                        <Check size={12} /> 已设置
                      </span>
                    ) : (
                      <span className="text-[12px] text-warning">未设置</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel px-6 py-5">
              <h2 className="text-[16px] font-bold text-text mb-4">登录动态</h2>
              {logins.length === 0 ? (
                <p className="text-[13px] text-text-muted">该账号尚未激活，暂无登录记录</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {logins.map((log, i) => (
                    <div key={log.time} className="flex items-start gap-3">
                      <div
                        className={`w-[30px] h-[30px] rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                          i === 0 ? 'bg-primary-bg' : 'bg-surface-secondary'
                        }`}
                      >
                        {i === 0 ? (
                          <LogIn size={14} className="text-primary" />
                        ) : (
                          <Monitor size={14} className="text-text-placeholder" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-text">{log.device}</span>
                          {log.current && (
                            <span className="text-[12px] px-1.5 py-[1px] rounded-sm bg-success-bg text-success">当前</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[12px] text-text-muted">
                          <span>{log.time}</span>
                          <span className="inline-flex items-center gap-[3px]">
                            <MapPin size={10} /> 公司内网
                          </span>
                          <span>{loginIp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
