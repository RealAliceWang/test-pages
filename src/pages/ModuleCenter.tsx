import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Boxes, ChevronRight, KeyRound, PackageCheck, Wallet } from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import TabFilter from '../components/common/TabFilter';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import { moduleIconMap } from '../assets/moduleIcons';
import { categories } from '../domain/seed';
import { can } from '../domain/permissions';
import {
  allocatedSeats, assignmentsOfMember, decideKind, isExpired, kindHint, kindLabels,
  poolOf, spareSeats, useApp,
} from '../store';
import type { ModuleEdition } from '../domain/types';

const editionFilters: ('全部' | ModuleEdition)[] = ['全部', '免费版', '商业版'];
const PAGE = 24;

export default function ModuleCenter() {
  const navigate = useNavigate();
  const { state, me, myOrg } = useApp();

  const [cat, setCat] = useState(0);
  const [edition, setEdition] = useState(0);
  const [limit, setLimit] = useState(PAGE);

  /* Search lives in the URL so the header's global search can land here with a
     term already applied, and so a filtered view stays shareable. */
  const [params, setParams] = useSearchParams();
  const search = params.get('q') ?? '';
  const setSearch = (v: string) => {
    setParams(v ? { q: v } : {}, { replace: true });
    setLimit(PAGE);
  };

  const mySeatModuleIds = useMemo(
    () => new Set(assignmentsOfMember(state, me.id).filter((a) => a.status === '生效中').map((a) => a.moduleId)),
    [state, me.id],
  );

  const catTabs = ['全部模块', ...categories];
  const selectedCat = catTabs[cat];
  const selectedEdition = editionFilters[edition];

  const list = state.catalog.filter((m) => {
    if (!m.listed) return false;
    if (selectedCat !== '全部模块' && m.category !== selectedCat) return false;
    if (selectedEdition !== '全部' && m.edition !== selectedEdition) return false;
    if (search && !m.name.includes(search) && !m.code.includes(search)) return false;
    return true;
  });

  // Org-level snapshot: what we hold versus what is still idle.
  const orgPools = state.seatPools.filter((p) => p.orgId === me.orgId);
  const openedModules = orgPools.length;
  const idleSeats = orgPools.reduce((s, p) => s + spareSeats(state, p), 0);
  const commercialCount = state.catalog.filter((m) => m.edition === '商业版' && m.listed).length;

  const stats: Metric[] = [
    { icon: Boxes, value: state.catalog.filter((m) => m.listed).length, label: '在架模块', hint: '厂商已上架，可申请或购买', tone: 'accent' },
    { icon: PackageCheck, value: openedModules, label: '本企业已开通', hint: '已建立席位池的模块', tone: 'positive' },
    { icon: KeyRound, value: idleSeats, label: '可直接分配的空闲席位', hint: '申请后走部门审批即可到手', tone: idleSeats ? 'positive' : 'attention' },
    { icon: Wallet, value: commercialCount, label: '商业版模块', hint: '池满后需走采购流程', tone: 'neutral' },
  ];

  const canApply = can(me.role, 'application:create');

  return (
    <div>
      <Header
        title="模块中心"
        subtitle={`浏览全部可用模块 · ${myOrg.shortName} 已开通 ${openedModules} 个模块，${idleSeats} 个席位空闲`}
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-5 stagger">
          {stats.map((s, i) => (
            <MetricCard key={i} metric={s} />
          ))}
        </div>

        <div className="panel px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <TabFilter tabs={catTabs.map((c) => ({ label: c }))} activeIndex={cat} onChange={(i) => { setCat(i); setLimit(PAGE); }} />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 border-l border-border pl-3">
              {editionFilters.map((e, i) => (
                <button key={e} onClick={() => { setEdition(i); setLimit(PAGE); }}
                  className={`h-[30px] px-[14px] rounded-full text-[13px] font-semibold cursor-pointer transition-colors ${
                    i === edition ? 'bg-primary-bg text-primary' : 'text-text-secondary hover:bg-surface-hover'
                  }`}>
                  {e}
                </button>
              ))}
            </div>
            <div className="w-[220px]">
              <SearchBar placeholder="搜索模块名称或编号..." value={search} onChange={(v) => { setSearch(v); setLimit(PAGE); }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {list.slice(0, limit).map((m) => {
            const pool = poolOf(state, me.orgId, m.id);
            const held = mySeatModuleIds.has(m.id);
            const spare = pool ? spareSeats(state, pool) : 0;
            const expired = pool ? isExpired(state, pool) : false;

            const availability = held
              ? '已开通'
              : !pool || expired
                ? '未开通'
                : spare > 0
                  ? '席位充足'
                  : '席位已满';

            const kind = decideKind(state, me.orgId, m.id, 1);
            const hint = held
              ? '已持有席位，可在「我的授权」查看'
              : kindHint(state, me.orgId, m.id);

            return (
              <div key={m.id}
                onClick={() => navigate(`/module/${m.id}`)}
                className="panel panel-hover p-5 flex flex-col cursor-pointer">
                <div className="flex items-start gap-3">
                  <span className="w-[46px] h-[46px] rounded-full bg-surface-secondary flex items-center justify-center shrink-0">
                    <img src={moduleIconMap[m.icon] || moduleIconMap.building} alt=""
                      className="w-[28px] h-[28px] object-contain" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-[6px]">
                      <p className="text-[15px] font-bold text-text truncate tracking-[-0.01em]">{m.name}</p>
                      <span className={`shrink-0 text-[11.5px] font-semibold px-2 py-[2px] rounded-full ${
                        m.edition === '商业版' ? 'bg-orange-bg text-orange' : 'bg-surface-hover text-text-muted'
                      }`}>
                        {m.edition}
                      </span>
                    </div>
                    <p className="text-[13px] text-text-muted mt-[3px]">{m.code}</p>
                  </div>
                  <StatusBadge status={availability} />
                </div>

                <p className="text-[13px] text-text-secondary mt-3 leading-relaxed line-clamp-2 min-h-[38px]">
                  {m.description}
                </p>

                <div className="flex items-center gap-4 mt-3.5 text-[13px] text-text-muted">
                  <span className="num">{m.duration} 天</span>
                  <span className="num">{m.nodes} 节点</span>
                  {m.unitPrice > 0 && (
                    <span className="num ml-auto text-[14px] font-bold text-text">
                      ¥{m.unitPrice.toLocaleString()}
                      <span className="text-[12px] text-text-muted font-medium">/席位/年</span>
                    </span>
                  )}
                </div>

                {pool && !expired && (
                  <div className="mt-3.5">
                    <div className="meter">
                      <span
                        style={{
                          width: `${pool.total ? Math.round((allocatedSeats(state, pool.id) / pool.total) * 100) : 0}%`,
                          background: spare > 0 ? 'var(--color-signal)' : 'var(--color-warning-light)',
                        }}
                      />
                    </div>
                    <p className="num text-[12px] text-text-muted mt-[6px]">
                      企业席位 {allocatedSeats(state, pool.id)}/{pool.total} 已分配
                    </p>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  {canApply ? (
                    <button
                      disabled={held}
                      onClick={(e) => { e.stopPropagation(); navigate(`/apply/${m.id}`); }}
                      className={`w-full h-[38px] text-[13.5px] font-semibold inline-flex items-center justify-center gap-1 ${
                        held ? 'btn-soft text-text-placeholder cursor-not-allowed' : 'btn-primary cursor-pointer'
                      }`}>
                      {held ? '已持有席位' : <>申请授权 <ChevronRight size={14} /></>}
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/module/${m.id}`); }}
                      className="btn-soft w-full h-[38px] text-[13.5px] font-semibold cursor-pointer">
                      查看详情
                    </button>
                  )}
                  <p className="text-[12px] text-text-placeholder mt-2 leading-snug">
                    {canApply ? hint : `${kindLabels[kind]} · 厂商侧不参与企业内申请`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {list.length > limit && (
          <button onClick={() => setLimit(limit + PAGE)}
            className="btn-ghost mx-auto h-[40px] px-7 text-[13.5px] font-semibold cursor-pointer">
            加载更多（还有 {list.length - limit} 个）
          </button>
        )}

        {list.length === 0 && (
          <div className="panel py-16 text-center">
            <span className="w-[56px] h-[56px] rounded-full bg-surface-secondary flex items-center justify-center mx-auto mb-4">
              <Boxes size={26} className="text-text-placeholder" />
            </span>
            <p className="text-[15px] text-text-muted">没有符合条件的模块</p>
          </div>
        )}
      </div>
    </div>
  );
}
