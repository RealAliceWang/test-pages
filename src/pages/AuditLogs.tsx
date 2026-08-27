import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { CalendarDays, ChevronDown, Globe, History, Inbox, RotateCcw, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import { daysBetween, memberOf, orgOf, useApp, visibleAudit } from '../store';
import { scopeOf } from '../domain/permissions';
import { roleLabels } from '../domain/types';
import type { AuditAction, AuditLog, Role } from '../domain/types';

type ActionGroup = '审批类' | '席位类' | '订单类' | '成员类' | '厂商类';

/**
 * Every audit action belongs to exactly one group. Typing this as a total
 * record makes the compiler reject a new AuditAction that nobody classified.
 */
const groupOf: Record<AuditAction, ActionGroup> = {
  '提交申请': '审批类',
  '撤销申请': '审批类',
  '部门审批通过': '审批类',
  '部门审批驳回': '审批类',
  '企业审批通过': '审批类',
  '企业审批驳回': '审批类',
  '厂商审批通过': '审批类',
  '厂商审批驳回': '审批类',
  '分配席位': '席位类',
  '回收席位': '席位类',
  '续费席位池': '席位类',
  '创建订单': '订单类',
  '支付订单': '订单类',
  '确认到账': '订单类',
  '取消订单': '订单类',
  '邀请成员': '成员类',
  '停用成员': '成员类',
  '启用成员': '成员类',
  '变更角色': '成员类',
  '变更部门': '成员类',
  '模块上架': '厂商类',
  '模块下架': '厂商类',
  '调整定价': '厂商类',
  '调整免费额度': '厂商类',
  '停用企业': '厂商类',
  '启用企业': '厂商类',
};

const groups: ActionGroup[] = ['审批类', '席位类', '订单类', '成员类', '厂商类'];

const allActions = Object.keys(groupOf) as AuditAction[];

/** Category chips reuse the semantic token pairs so they stay on-palette. */
const groupStyles: Record<ActionGroup, string> = {
  '审批类': 'bg-primary-bg text-primary-dark',
  '席位类': 'bg-success-bg text-success',
  '订单类': 'bg-orange-bg text-orange',
  '成员类': 'bg-warning-bg text-warning',
  '厂商类': 'bg-violet-bg text-violet',
};

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function weekdayOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return weekdays[new Date(y, m - 1, d).getDay()];
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[32px] pl-3 pr-[30px] text-[14px] text-text field appearance-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-[10px] top-1/2 -translate-y-1/2 text-text-placeholder pointer-events-none"
      />
    </div>
  );
}

export default function AuditLogs() {
  const { state, me, myOrg, myDept } = useApp();
  const scope = scopeOf(me.role);

  const logs = useMemo(() => visibleAudit(state, me), [state, me]);

  const [groupIndex, setGroupIndex] = useState(0);
  const [action, setAction] = useState('');
  const [actorId, setActorId] = useState('');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  const activeGroup = groupIndex === 0 ? null : groups[groupIndex - 1];

  const scopeLabel =
    scope === 'platform'
      ? '全平台（含厂商侧操作）'
      : scope === 'org'
        ? `全企业（${myOrg.shortName}）`
        : `本部门（${myDept?.name ?? '未分配部门'}）`;

  const today = state.now.slice(0, 10);
  const todayCount = logs.filter((l) => l.createdAt.slice(0, 10) === today).length;
  const weekCount = logs.filter((l) => {
    const gap = daysBetween(l.createdAt.slice(0, 10), today);
    return gap >= 0 && gap <= 6;
  }).length;
  const platformCount = logs.filter((l) => l.orgId === null).length;

  const actors = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; role: Role }>();
    logs.forEach((l) => {
      if (!seen.has(l.actorId)) seen.set(l.actorId, { id: l.actorId, name: l.actorName, role: l.actorRole });
    });
    return [...seen.values()];
  }, [logs]);

  // Only offer the actions that actually occur inside the selected group.
  const actionOptions = useMemo(() => {
    const present = new Set(
      logs.filter((l) => !activeGroup || groupOf[l.action] === activeGroup).map((l) => l.action),
    );
    return allActions.filter((a) => present.has(a));
  }, [logs, activeGroup]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (activeGroup && groupOf[l.action] !== activeGroup) return false;
      if (action && l.action !== action) return false;
      if (actorId && l.actorId !== actorId) return false;
      if (keyword) {
        const hit =
          l.target.toLowerCase().includes(keyword) || l.detail.toLowerCase().includes(keyword);
        if (!hit) return false;
      }
      return true;
    });
  }, [logs, activeGroup, action, actorId, query]);

  // visibleAudit is already newest-first, so insertion order keeps days sorted.
  const days = useMemo(() => {
    const map = new Map<string, AuditLog[]>();
    filtered.forEach((l) => {
      const date = l.createdAt.slice(0, 10);
      const bucket = map.get(date);
      if (bucket) bucket.push(l);
      else map.set(date, [l]);
    });
    return [...map.entries()];
  }, [filtered]);

  const tabs = [
    { label: `全部 ${logs.length}` },
    ...groups.map((g) => ({ label: `${g} ${logs.filter((l) => groupOf[l.action] === g).length}` })),
  ];

  const filterActive = groupIndex !== 0 || action !== '' || actorId !== '' || query !== '';

  const stats: Metric[] = [
    { icon: History, value: todayCount, label: '今日操作', hint: '当天产生的审计记录', tone: 'accent' },
    { icon: CalendarDays, value: weekCount, label: '近 7 天操作', hint: '滚动 7 日窗口', tone: 'neutral' },
    { icon: Users, value: actors.length, label: '涉及操作人', hint: `数据范围：${scopeLabel}`, tone: 'neutral' },
    scope === 'platform'
      ? { icon: Globe, value: platformCount, label: '厂商侧平台操作', hint: '跨企业的运营动作', tone: 'neutral' }
      : { icon: Globe, value: filtered.length, label: '当前筛选结果', hint: filterActive ? '已应用筛选条件' : '未筛选，展示全部', tone: 'neutral' },
  ];

  const reset = () => {
    setGroupIndex(0);
    setAction('');
    setActorId('');
    setQuery('');
  };

  const toggle = (id: string) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const lastId = filtered.length > 0 ? filtered[filtered.length - 1].id : '';

  return (
    <div>
      <Header
        title="审计日志"
        subtitle={`数据范围：${scopeLabel} · 共 ${logs.length} 条记录`}
        actions={
          <span className="text-[13px] text-text-secondary bg-surface-secondary rounded-sm px-2.5 py-1">
            {scope === 'platform' ? '厂商运营视角' : scope === 'org' ? '企业管理员视角' : '部门管理员视角'}
          </span>
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        {/* Activity stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 stagger">
          {stats.map((s) => (
            <MetricCard key={s.label} metric={s} />
          ))}
        </div>

        {/* Filters */}
        <div className="panel px-5 py-4 flex flex-col gap-3.5">
          <TabFilter
            tabs={tabs}
            activeIndex={groupIndex}
            onChange={(i) => {
              setGroupIndex(i);
              setAction('');
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect label="操作类型" value={action} onChange={setAction}>
              <option value="">{activeGroup ? `${activeGroup}全部操作` : '全部操作类型'}</option>
              {actionOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect label="操作人" value={actorId} onChange={setActorId}>
              <option value="">全部操作人</option>
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {roleLabels[a.role]}
                </option>
              ))}
            </FilterSelect>

            <div className="w-[280px]">
              <SearchBar placeholder="搜索操作对象或详情" value={query} onChange={setQuery} />
            </div>

            <span className="text-[13px] text-text-muted">
              命中 <span className="text-text tabular-nums">{filtered.length}</span> / {logs.length} 条
            </span>

            {filterActive && (
              <button
                onClick={reset}
                className="h-[32px] px-3 text-[13px] text-text-secondary bg-surface-hover rounded-sm cursor-pointer inline-flex items-center gap-1.5 hover:bg-border transition-colors"
              >
                <RotateCcw size={13} /> 重置筛选
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        {filtered.length === 0 ? (
          <div className="panel py-20 flex flex-col items-center gap-2">
            <Inbox size={40} className="text-text-placeholder" />
            <p className="text-[15px] text-text mt-1">
              {logs.length === 0 ? '当前范围内还没有审计记录' : '没有符合筛选条件的记录'}
            </p>
            <p className="text-[13px] text-text-muted">
              {logs.length === 0
                ? `${scopeLabel}的成员尚未产生可审计的操作，后续操作会自动留痕`
                : '可以换一个操作类型分组，或清空搜索关键词'}
            </p>
            {logs.length > 0 && (
              <button
                onClick={reset}
                className="mt-2 h-[32px] px-4 text-[14px] text-primary bg-primary-bg rounded-sm cursor-pointer hover:bg-border transition-colors"
              >
                清空筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="panel px-5 py-5 flex flex-col gap-5">
            {days.map(([date, items]) => {
              const gap = daysBetween(date, today);
              const relative = gap === 0 ? '今天' : gap === 1 ? '昨天' : '';
              return (
                <div key={date} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-medium text-text tabular-nums">{date}</span>
                    <span className="text-[13px] text-text-muted">{weekdayOf(date)}</span>
                    {relative && <StatusBadge status={relative} tone="info" />}
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[13px] text-text-muted tabular-nums">{items.length} 条</span>
                  </div>

                  {items.map((log) => {
                    const group = groupOf[log.action];
                    const style = groupStyles[group];
                    const actor = memberOf(state, log.actorId);
                    const isPlatform = log.orgId === null;
                    const open = expanded.includes(log.id);
                    const longDetail = log.detail.length > 26;
                    return (
                      <div key={log.id} className="flex gap-3">
                        <span className="w-[42px] shrink-0 text-[13px] text-text-muted tabular-nums pt-[11px]">
                          {log.createdAt.slice(11)}
                        </span>

                        <div className="flex flex-col items-center shrink-0">
                          <div
                            className="w-[28px] h-[28px] mt-[6px] rounded-full flex items-center justify-center text-white text-[12.5px] font-semibold shrink-0"
                            style={{ background: actor?.avatarColor ?? 'var(--color-text-placeholder)' }}
                          >
                            {log.actorName.charAt(0)}
                          </div>
                          {log.id !== lastId && <div className="flex-1 w-px bg-border mt-2 min-h-[12px]" />}
                        </div>

                        <div
                          className={`flex-1 min-w-0 rounded-md border border-hairline px-4 py-3 transition-colors hover:bg-surface-hover ${
                            isPlatform ? 'bg-surface-secondary' : 'bg-surface'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-[14px] text-text">{log.actorName}</span>
                              <StatusBadge status={roleLabels[log.actorRole]} tone="neutral" />
                              <span
                                className={`text-[12.5px] font-semibold rounded-full px-2.5 py-[3px] leading-[16px] whitespace-nowrap ${style}`}
                              >
                                {log.action}
                              </span>
                              {isPlatform && (
                                <span className="text-[12px] text-primary bg-primary-bg rounded-sm px-1.5 py-[1px] inline-flex items-center gap-1 whitespace-nowrap">
                                  <Globe size={11} /> 平台操作
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => toggle(log.id)}
                              aria-expanded={open}
                              className="shrink-0 text-[13px] text-text-muted cursor-pointer inline-flex items-center gap-1 hover:text-primary transition-colors"
                            >
                              {open ? '收起' : '详情'}
                              <ChevronDown
                                size={13}
                                className={`transition-transform ${open ? 'rotate-180' : ''}`}
                              />
                            </button>
                          </div>

                          <div className="mt-2 flex items-baseline gap-2 min-w-0">
                            <span className="text-[13px] text-text-muted shrink-0">操作对象</span>
                            <span className="text-[14px] text-text-secondary truncate">{log.target}</span>
                          </div>

                          <p
                            className={`text-[14px] text-text-secondary mt-1 leading-relaxed ${
                              open || !longDetail ? '' : 'truncate'
                            }`}
                          >
                            {log.detail}
                          </p>

                          <div className="mt-2 flex items-center gap-3 text-[12px] text-text-muted">
                            <span className="tabular-nums">IP {log.ip}</span>
                            <span>{group}</span>
                          </div>

                          {open && (
                            <div className="mt-3 pt-3 border-t border-hairline grid grid-cols-2 lg:grid-cols-4 gap-3">
                              <div>
                                <p className="text-[12px] text-text-muted">完整时间</p>
                                <p className="text-[13px] text-text-secondary mt-[3px] tabular-nums">
                                  {log.createdAt}
                                </p>
                              </div>
                              <div>
                                <p className="text-[12px] text-text-muted">操作来源</p>
                                <p className="text-[13px] text-text-secondary mt-[3px]">
                                  {isPlatform ? '厂商平台侧' : (orgOf(state, log.orgId ?? '')?.shortName ?? '—')}
                                </p>
                              </div>
                              <div>
                                <p className="text-[12px] text-text-muted">操作人账号</p>
                                <p className="text-[13px] text-text-secondary mt-[3px]">
                                  {actor ? `${actor.employeeNo} · ${actor.title}` : log.actorId}
                                </p>
                              </div>
                              <div>
                                <p className="text-[12px] text-text-muted">登录 IP</p>
                                <p className="text-[13px] text-text-secondary mt-[3px] tabular-nums">{log.ip}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
