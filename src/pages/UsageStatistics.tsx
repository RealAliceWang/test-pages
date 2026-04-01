import { useState } from 'react';
import { Clock, Users, Box, Activity, ChevronDown, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import Header from '../components/layout/Header';
import StatCard from '../components/common/StatCard';
import { usageTrend, moduleDistribution, moduleRanking, departmentUsage } from '../data/mock';

const ranges = ['最近7天', '最近30天', '最近90天'];

export default function UsageStatistics() {
  const [range, setRange] = useState('最近7天');
  const [open, setOpen] = useState(false);

  const card = "bg-white rounded p-5";
  const cardStyle = {};

  return (
    <div className="min-h-screen">
      <Header title="使用统计" subtitle="查看系统使用情况和数据分析" />
      <div className="p-6 flex flex-col gap-5">
        <div className="grid grid-cols-4 gap-5">
          <StatCard horizontal icon={<Clock size={22} color="#1C71D8" />} iconBg="bg-[#E8F3FF]" value="1,245" unit="小时" label="总使用时长" />
          <StatCard horizontal icon={<Users size={22} color="#00B42A" />} iconBg="bg-[#E8FFEA]" value="89" unit="人" label="活跃用户" />
          <StatCard horizontal icon={<Box size={22} color="#D4770B" />} iconBg="bg-[#FFF3E8]" value="15" unit="个" label="使用模块" />
          <StatCard horizontal icon={<Activity size={22} color="#F53F3F" />} iconBg="bg-[#FFECE8]" value="3.5" unit="小时/天" label="平均在线" />
        </div>

        {/* Time selector */}
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-[#C9CDD4]" />
          <span className="text-[14px] text-[#86909C]">时间范围</span>
          <div className="relative">
            <button onClick={() => setOpen(!open)} className="h-[30px] px-3 text-[14px] bg-[#F2F3F5] rounded inline-flex items-center gap-[6px] hover:bg-[#E5E6EB] transition-colors">
              {range} <ChevronDown size={13} className="text-[#C9CDD4]" />
            </button>
            {open && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#E5E6EB] rounded overflow-hidden z-10 min-w-[110px]" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                {ranges.map((r) => (
                  <button key={r} onClick={() => { setRange(r); setOpen(false); }} className={`block w-full text-left px-3 py-[7px] text-[14px] hover:bg-[#F2F3F5] transition-colors ${r === range ? 'text-[#1C71D8] font-medium bg-[#E8F3FF]' : 'text-[#4E5969]'}`}>{r}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Charts top */}
        <div className="grid grid-cols-2 gap-5">
          <div className={card} style={cardStyle}>
            <h3 className="text-[14px] font-bold text-[#1D2129] mb-4">使用趋势分析</h3>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={usageTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" />
                <XAxis dataKey="date" tick={{ fontSize: 14, fill: '#86909C' }} axisLine={{ stroke: '#E5E6EB' }} tickLine={false} />
                <YAxis tick={{ fontSize: 14, fill: '#86909C' }} axisLine={{ stroke: '#E5E6EB' }} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E6EB', fontSize: 14, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
                <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 14, color: '#86909C', paddingTop: 8 }} />
                <Line type="monotone" dataKey="usage" stroke="#1C71D8" strokeWidth={2} dot={{ r: 3, fill: '#1C71D8', strokeWidth: 0 }} activeDot={{ r: 5 }} name="使用次数" />
                <Line type="monotone" dataKey="activeUsers" stroke="#00B42A" strokeWidth={2} dot={{ r: 3, fill: '#00B42A', strokeWidth: 0 }} activeDot={{ r: 5 }} name="活跃用户" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className={card} style={cardStyle}>
            <h3 className="text-[14px] font-bold text-[#1D2129] mb-4">模块使用分布</h3>
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie data={moduleDistribution} cx="50%" cy="50%" outerRadius={120} dataKey="value" label={({ name, value }) => `${name} ${value}%`} fontSize={14} labelLine={{ stroke: '#C9CDD4', strokeWidth: 1 }} stroke="none">
                  {moduleDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: 8, border: '1px solid #E5E6EB', fontSize: 14 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts bottom */}
        <div className="grid grid-cols-2 gap-5">
          <div className={card} style={cardStyle}>
            <h3 className="text-[14px] font-bold text-[#1D2129] mb-4">模块使用排行</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={moduleRanking} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F3F5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 14, fill: '#86909C' }} axisLine={{ stroke: '#E5E6EB' }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 14, fill: '#4E5969' }} axisLine={false} tickLine={false} width={65} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E6EB', fontSize: 14 }} />
                <Bar dataKey="count" fill="#1C71D8" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={card} style={cardStyle}>
            <h3 className="text-[14px] font-bold text-[#1D2129] mb-4">部门使用情况</h3>
            <div className="flex flex-col gap-[28px] pt-2">
              {departmentUsage.map((d) => (
                <div key={d.name}>
                  <div className="flex items-center justify-between mb-[6px]">
                    <span className="text-[14px] text-[#4E5969]">{d.name}</span>
                    <span className="text-[14px] text-[#86909C] tabular-nums">{d.current}/{d.total}</span>
                  </div>
                  <div className="h-[6px] bg-[#F2F3F5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((d.current / d.total) * 100)}%`, background: '#1C71D8' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
