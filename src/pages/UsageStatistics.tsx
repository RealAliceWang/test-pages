import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Clock, Users, Box, Activity, ChevronDown, Calendar, CalendarDays } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Header from '../components/layout/Header';
import type { UserRole } from '../components/layout/Layout';
import {
  usageTrend, myUsageTrend,
  moduleDistribution, moduleRanking, myModuleRanking,
  departmentUsage, myModuleStats,
} from '../data/mock';

const ranges = ['最近7天', '最近30天', '最近90天'];

function ChartSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-3 pt-4">
      <div className="h-4 bg-surface-hover rounded w-1/3" />
      <div className="h-[280px] bg-surface-hover rounded-[--radius-md]" />
      <div className="flex gap-4 justify-center">
        <div className="h-3 bg-surface-hover rounded w-16" />
        <div className="h-3 bg-surface-hover rounded w-16" />
      </div>
    </div>
  );
}

export default function UsageStatistics() {
  const { role, setRole } = useOutletContext<{ role: UserRole; setRole: (r: UserRole) => void }>();
  const [range, setRange] = useState('最近7天');
  const [open, setOpen] = useState(false);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Simulate chart loading
  useEffect(() => {
    const timer = setTimeout(() => setChartsLoaded(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const isAdmin = role === 'admin';
  const card = "bg-surface rounded-[--radius-md] p-5";

  const adminCards = [
    { icon: <Clock size={32} />, value: '1,245', unit: '小时', label: '总使用时长', accent: '#2563EB', bar: '#2563EB', trend: '+12%', up: true },
    { icon: <Users size={32} />, value: '89', unit: '人', label: '活跃用户', accent: '#16A34A', bar: '#16A34A', trend: '+5%', up: true },
    { icon: <Box size={32} />, value: '15', unit: '个', label: '使用模块', accent: '#EA580C', bar: '#EA580C', trend: '+2', up: true },
    { icon: <Activity size={32} />, value: '3.5', unit: '小时/天', label: '平均在线', accent: '#7C3AED', bar: '#7C3AED', trend: '-0.3', up: false },
  ];

  const userCards = [
    { icon: <Clock size={32} />, value: '186', unit: '小时', label: '我的使用时长', accent: '#2563EB', bar: '#2563EB', trend: '+8%', up: true },
    { icon: <CalendarDays size={32} />, value: '22', unit: '天', label: '本月使用天数', accent: '#16A34A', bar: '#16A34A', trend: '+3', up: true },
    { icon: <Box size={32} />, value: '5', unit: '个', label: '已开通模块', accent: '#EA580C', bar: '#EA580C', trend: '—', up: true },
    { icon: <Activity size={32} />, value: '3.5', unit: '小时/天', label: '日均使用', accent: '#7C3AED', bar: '#7C3AED', trend: '+0.5', up: true },
  ];

  const statusColors: Record<string, string> = {
    '使用中': '#00B42A',
    '即将到期': '#F77234',
    '已过期': '#F53F3F',
  };

  return (
    <div className="min-h-screen">
      <Header
        title="使用统计"
        subtitle={isAdmin ? '查看系统使用情况和数据分析' : '查看个人使用情况和数据分析'}
        role={role}
        onRoleChange={setRole}
      />
      <div className="p-6 flex flex-col gap-5">
        {/* Summary cards — responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {(isAdmin ? adminCards : userCards).map((s, i) => (
            <div key={i} className="relative bg-surface rounded-[--radius-lg] overflow-hidden"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="h-[3px]" style={{ background: s.bar }} />
              <div className="px-5 pt-4 pb-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[14px] text-text-muted font-medium">{s.label}</p>
                  <span className={`text-[12px] font-medium px-1.5 py-[1px] rounded ${s.up ? 'text-[#16A34A] bg-[rgba(34,197,94,0.08)]' : 'text-[#DC2626] bg-[rgba(239,68,68,0.08)]'}`}>
                    {s.trend}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[30px] font-bold text-text leading-none tracking-tight tabular-nums">{s.value}</span>
                    <span className="text-[14px] text-text-muted ml-1">{s.unit}</span>
                  </div>
                  <div className="opacity-15" style={{ color: s.accent }}>{s.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Time selector — click outside to close */}
        <div className="bg-surface rounded-[--radius-md] px-5 py-3 flex items-center gap-2">
          <Calendar size={14} className="text-text-placeholder" />
          <span className="text-[14px] text-text-muted">时间范围</span>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-haspopup="listbox"
              className="h-[30px] px-3 text-[14px] bg-surface-hover rounded-[--radius-sm] cursor-pointer inline-flex items-center gap-[6px] hover:bg-border transition-colors"
            >
              {range} <ChevronDown size={13} className="text-text-placeholder" />
            </button>
            {open && (
              <div
                className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-[--radius-md] overflow-hidden z-10 min-w-[110px]"
                style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                role="listbox"
              >
                {ranges.map((r) => (
                  <button
                    key={r}
                    role="option"
                    aria-selected={r === range}
                    onClick={() => { setRange(r); setOpen(false); }}
                    className={`block w-full text-left px-3 py-[7px] text-[14px] cursor-pointer hover:bg-surface-hover transition-colors ${r === range ? 'text-primary font-medium bg-primary-bg' : 'text-text-secondary'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts top row — responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={card}>
            <h3 className="text-[14px] font-bold text-text mb-4">使用趋势分析</h3>
            {!chartsLoaded ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={340}>
                {isAdmin ? (
                  <LineChart data={usageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                    <XAxis dataKey="date" tick={{ fontSize: 14, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 14, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 14, color: 'var(--color-text-muted)', paddingTop: 8 }} />
                    <Line type="monotone" dataKey="usage" stroke="#1C71D8" strokeWidth={2} dot={{ r: 3, fill: '#1C71D8', strokeWidth: 0 }} activeDot={{ r: 5 }} name="使用次数" />
                    <Line type="monotone" dataKey="activeUsers" stroke="#00B42A" strokeWidth={2} dot={{ r: 3, fill: '#00B42A', strokeWidth: 0 }} activeDot={{ r: 5 }} name="活跃用户" />
                  </LineChart>
                ) : (
                  <LineChart data={myUsageTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                    <XAxis dataKey="date" tick={{ fontSize: 14, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 14, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 14, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} unit="h" />
                    <Tooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                    <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 14, color: 'var(--color-text-muted)', paddingTop: 8 }} />
                    <Line yAxisId="left" type="monotone" dataKey="usage" stroke="#1C71D8" strokeWidth={2} dot={{ r: 3, fill: '#1C71D8', strokeWidth: 0 }} activeDot={{ r: 5 }} name="使用次数" />
                    <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#F77234" strokeWidth={2} dot={{ r: 3, fill: '#F77234', strokeWidth: 0 }} activeDot={{ r: 5 }} name="使用时长(小时)" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
          <div className={card}>
            <h3 className="text-[14px] font-bold text-text mb-4">模块使用分布</h3>
            {!chartsLoaded ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie data={moduleDistribution} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, value }) => `${name} ${value}%`} fontSize={14} labelLine={{ stroke: 'var(--color-text-placeholder)', strokeWidth: 1 }} stroke="none">
                    {moduleDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 14 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Charts bottom row — responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className={card}>
            <h3 className="text-[14px] font-bold text-text mb-4">
              {isAdmin ? '模块使用排行' : '我的模块使用排行'}
            </h3>
            {!chartsLoaded ? <ChartSkeleton /> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={isAdmin ? moduleRanking : myModuleRanking} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 14, fill: 'var(--color-text-muted)' }} axisLine={{ stroke: 'var(--color-border)' }} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 14, fill: 'var(--color-text-secondary)' }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 14 }} />
                  <Bar dataKey="count" fill="#1C71D8" radius={[0, 4, 4, 0]} barSize={16} name={isAdmin ? '使用次数' : '使用天数'} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {isAdmin ? (
            <div className={card}>
              <h3 className="text-[14px] font-bold text-text mb-4">部门使用情况</h3>
              <div className="flex flex-col gap-[28px] pt-2">
                {departmentUsage.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <span className="text-[14px] text-text-secondary">{d.name}</span>
                      <span className="text-[14px] text-text-muted tabular-nums">{d.current}/{d.total}</span>
                    </div>
                    <div className="h-[6px] bg-surface-hover rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((d.current / d.total) * 100)}%`, background: '#1C71D8' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={card}>
              <h3 className="text-[14px] font-bold text-text mb-4">我的模块使用详情</h3>
              <div className="flex flex-col gap-[28px] pt-2">
                {myModuleStats.map((m) => (
                  <div key={m.name}>
                    <div className="flex items-center justify-between mb-[6px]">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-text-secondary">{m.name}</span>
                        <span
                          className="text-[12px] px-1.5 py-[1px] rounded-[--radius-sm]"
                          style={{
                            color: statusColors[m.status],
                            backgroundColor: statusColors[m.status] + '15',
                          }}
                        >
                          {m.status}
                        </span>
                      </div>
                      <span className="text-[14px] text-text-muted tabular-nums">{m.usedDays}/{m.totalDays}天</span>
                    </div>
                    <div className="h-[6px] bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.round((m.usedDays / m.totalDays) * 100)}%`,
                          background: statusColors[m.status] || '#1C71D8',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
