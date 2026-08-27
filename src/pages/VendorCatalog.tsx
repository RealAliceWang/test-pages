import { useMemo, useState } from 'react';
import {
  ArrowDown, ArrowUp, Boxes, CircleCheck, Clock, Coins, Cpu, Crown,
  Lock, PackageX, Tag, TriangleAlert, Users,
} from 'lucide-react';
import Header from '../components/layout/Header';
import MetricCard, { type Metric } from '../components/common/MetricCard';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import StatusBadge from '../components/common/StatusBadge';
import TabFilter from '../components/common/TabFilter';
import Toggle from '../components/common/Toggle';
import { useApp } from '../store';
import { categories } from '../domain/seed';
import type { CatalogModule } from '../domain/types';
import { moduleIconMap } from '../assets/moduleIcons';

interface CatalogRow {
  mod: CatalogModule;
  /** Seats held by customers for this module, across every pool. */
  soldSeats: number;
  orgCount: number;
}

const editionTabs = ['全部', '免费版', '商业版'] as const;
const listedOptions = ['全部状态', '已上架', '已下架'] as const;
const PAGE_SIZE = 12;

const selectCls =
  'h-[32px] px-2 text-[14px] text-text-secondary field outline-none focus:border-primary transition-colors cursor-pointer';
const numberInputCls =
  'w-full h-[40px] px-3 text-[15px] text-text bg-surface-secondary border border-border rounded-sm outline-none focus:border-primary focus:bg-surface transition-colors';

const columns = ['模块', '分类', '版本', '授权期限', '节点数', '单价', '已售席位', '开通企业', '上架状态', '操作'];

const money = (n: number) => `¥${n.toLocaleString()}`;

export default function VendorCatalog() {
  const { state, dispatch } = useApp();

  const [tab, setTab] = useState(0);
  const [category, setCategory] = useState(0);
  const [listed, setListed] = useState(0);
  const [search, setSearch] = useState('');
  const [shown, setShown] = useState(PAGE_SIZE);
  const [delistRow, setDelistRow] = useState<CatalogRow | null>(null);
  const [priceRow, setPriceRow] = useState<CatalogRow | null>(null);
  const [priceDraft, setPriceDraft] = useState('');

  const rows = useMemo<CatalogRow[]>(() => {
    return state.catalog.map((mod) => {
      const pools = state.seatPools.filter((p) => p.moduleId === mod.id);
      return {
        mod,
        soldSeats: pools.reduce((s, p) => s + p.total, 0),
        orgCount: new Set(pools.map((p) => p.orgId)).size,
      };
    });
  }, [state.catalog, state.seatPools]);

  const metrics = useMemo(() => {
    const commercial = rows.filter((r) => r.mod.edition === '商业版');
    const avg = commercial.length
      ? Math.round(commercial.reduce((s, r) => s + r.mod.unitPrice, 0) / commercial.length)
      : 0;
    return {
      total: rows.length,
      listed: rows.filter((r) => r.mod.listed).length,
      commercial: commercial.length,
      avgPrice: avg,
    };
  }, [rows]);

  const delistedCount = metrics.total - metrics.listed;

  const filtered = rows.filter((r) => {
    const edition = editionTabs[tab];
    if (edition !== '全部' && r.mod.edition !== edition) return false;
    if (category > 0 && r.mod.category !== categories[category - 1]) return false;
    if (listed === 1 && !r.mod.listed) return false;
    if (listed === 2 && r.mod.listed) return false;
    if (search && !r.mod.name.includes(search) && !r.mod.code.includes(search)) return false;
    return true;
  });

  const page = filtered.slice(0, shown);
  const rest = filtered.length - page.length;

  // Every filter change restarts paging, otherwise the list keeps a stale window.
  const resetPaging = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setShown(PAGE_SIZE);
  };

  const openPrice = (row: CatalogRow) => {
    setPriceDraft(String(row.mod.unitPrice));
    setPriceRow(row);
  };

  const priceValue = Number(priceDraft);
  const priceValid = priceDraft.trim() !== '' && Number.isInteger(priceValue) && priceValue > 0;
  const priceUnchanged = priceValid && priceRow ? priceValue === priceRow.mod.unitPrice : false;
  const priceSubmittable = priceValid && !priceUnchanged;
  const priceDelta =
    priceRow && priceValid && priceRow.mod.unitPrice > 0
      ? ((priceValue - priceRow.mod.unitPrice) / priceRow.mod.unitPrice) * 100
      : 0;

  const submitPrice = () => {
    if (!priceRow || !priceSubmittable) return;
    dispatch({ type: 'SET_MODULE_PRICE', moduleId: priceRow.mod.id, unitPrice: priceValue });
    setPriceRow(null);
  };

  const submitDelist = () => {
    if (!delistRow) return;
    dispatch({ type: 'SET_MODULE_LISTED', moduleId: delistRow.mod.id, listed: false });
    setDelistRow(null);
  };

  const cards: Metric[] = [
    { icon: Boxes, value: metrics.total, label: '模块总数', hint: '目录内全部模块', tone: 'accent' },
    { icon: CircleCheck, value: metrics.listed, label: '已上架', hint: '企业可见并可申请', tone: 'positive' },
    { icon: Crown, value: metrics.commercial, label: '商业版模块', hint: '需付费购买席位', tone: 'neutral' },
    { icon: Coins, value: money(metrics.avgPrice), label: '商业版平均单价', hint: '按席位年费计算', tone: 'neutral' },
  ];

  return (
    <div>
      <Header
        title="模块目录"
        subtitle="管理模块的上架状态与席位定价"
        actions={
          <span className="text-[13px] text-text-muted">
            已上架 {metrics.listed} / {metrics.total}
          </span>
        }
      />

      <div className="px-7 pb-7 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-5 stagger">
          {cards.map((c) => (
            <MetricCard key={c.label} metric={c} />
          ))}
        </div>

        {delistedCount > 0 && (
          <div className="bg-warning-bg border border-warning/30 rounded-md px-4 py-3 flex items-start gap-3">
            <PackageX size={16} className="text-warning shrink-0 mt-[2px]" />
            <p className="text-[14px] text-warning leading-[22px]">
              当前有 {delistedCount} 个模块处于下架状态。
              <span className="text-text-secondary">
                企业无法新申请或采购下架模块，但已发放的席位仍可正常使用至到期。
              </span>
            </p>
          </div>
        )}

        <div className="panel px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TabFilter
              tabs={editionTabs.map((e) => ({ label: e }))}
              activeIndex={tab}
              onChange={resetPaging(setTab)}
            />
            <select
              aria-label="模块分类"
              value={category}
              onChange={(e) => resetPaging(setCategory)(Number(e.target.value))}
              className={selectCls}
            >
              <option value={0}>全部分类</option>
              {categories.map((c, i) => (
                <option key={c} value={i + 1}>{c}</option>
              ))}
            </select>
            <select
              aria-label="上架状态"
              value={listed}
              onChange={(e) => resetPaging(setListed)(Number(e.target.value))}
              className={selectCls}
            >
              {listedOptions.map((o, i) => (
                <option key={o} value={i}>{o}</option>
              ))}
            </select>
          </div>
          <div className="w-[240px]">
            <SearchBar
              placeholder="搜索模块名称或编号..."
              value={search}
              onChange={resetPaging(setSearch)}
            />
          </div>
        </div>

        <div className="panel overflow-hidden">
          <table className="data-table w-full">
            <thead>
              <tr className="border-b border-hairline">
                {columns.map((h) => (
                  <th key={h} className="text-left text-[13px] font-normal text-text-muted px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {page.map((r, i) => {
                const { mod } = r;
                const free = mod.edition === '免费版';
                return (
                  <tr
                    key={mod.id}
                    className="hover:bg-surface-secondary transition-colors"
                    style={{ borderTop: i ? '1px solid var(--color-divider)' : 'none' }}
                  >
                    <td className="px-4 py-[12px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={moduleIconMap[mod.icon] ?? moduleIconMap.building}
                          alt=""
                          className="w-[32px] h-[32px] object-contain shrink-0"
                        />
                        <div className="min-w-0">
                          <p className={`text-[14px] font-medium ${mod.listed ? 'text-text' : 'text-text-muted'}`}>
                            {mod.name}
                          </p>
                          <p className="text-[13px] text-text-muted mt-[2px]">{mod.code}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-[12px] text-[14px] text-text-secondary whitespace-nowrap">
                      {mod.category}
                    </td>

                    <td className="px-4 py-[12px]">
                      <StatusBadge status={mod.edition} tone={free ? 'neutral' : 'warning'} />
                    </td>

                    <td className="px-4 py-[12px] text-[14px] text-text-secondary whitespace-nowrap">
                      <span className="inline-flex items-center gap-[4px]">
                        <Clock size={12} className="text-text-muted" /> {mod.duration} 天
                      </span>
                    </td>

                    <td className="px-4 py-[12px] text-[14px] text-text-secondary whitespace-nowrap">
                      <span className="inline-flex items-center gap-[4px]">
                        <Cpu size={12} className="text-text-muted" /> {mod.nodes}
                      </span>
                    </td>

                    <td className="px-4 py-[12px] whitespace-nowrap">
                      {free ? (
                        <span className="text-[14px] text-text-muted">免费</span>
                      ) : (
                        <span className="text-[15px] text-text">
                          {money(mod.unitPrice)}
                          <span className="text-[12px] text-text-muted ml-[3px]">/席位/年</span>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-[12px] text-[14px] whitespace-nowrap">
                      {r.soldSeats > 0 ? (
                        <span className="text-text">{r.soldSeats}</span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-[12px] text-[14px] whitespace-nowrap">
                      {r.orgCount > 0 ? (
                        <span className="text-text-secondary inline-flex items-center gap-[4px]">
                          <Users size={12} className="text-text-muted" /> {r.orgCount}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>

                    <td className="px-4 py-[12px]">
                      <div className="flex items-center gap-[10px]">
                        <Toggle
                          enabled={mod.listed}
                          onChange={(next) => {
                            if (next) {
                              dispatch({ type: 'SET_MODULE_LISTED', moduleId: mod.id, listed: true });
                            } else {
                              setDelistRow(r);
                            }
                          }}
                        />
                        <StatusBadge
                          status={mod.listed ? '已上架' : '已下架'}
                          tone={mod.listed ? 'success' : 'neutral'}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-[12px]">
                      {free ? (
                        <button
                          disabled
                          title="免费版通过厂商免费额度发放，不参与定价"
                          className="h-[30px] px-[10px] rounded-full text-[13px] text-text-placeholder bg-surface-hover cursor-not-allowed inline-flex items-center gap-[4px] whitespace-nowrap"
                        >
                          <Lock size={12} /> 不可定价
                        </button>
                      ) : (
                        <button
                          onClick={() => openPrice(r)}
                          className="h-[32px] px-3 rounded-full text-[13px] font-semibold text-primary bg-primary-bg hover:brightness-95 transition-all cursor-pointer inline-flex items-center gap-[4px] whitespace-nowrap"
                        >
                          <Tag size={12} /> 调整定价
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Boxes size={40} className="mx-auto mb-3 text-text-placeholder" />
              <p className="text-[14px] text-text-muted">没有符合条件的模块</p>
            </div>
          )}

          {rest > 0 && (
            <div className="px-5 py-4 border-t border-hairline flex items-center justify-center gap-3">
              <span className="text-[13px] text-text-muted">
                已显示 {page.length} / {filtered.length}
              </span>
              <button
                onClick={() => setShown(shown + PAGE_SIZE)}
                className="h-[34px] px-4 rounded-full text-[14px] font-semibold text-primary bg-primary-bg hover:brightness-95 transition-all cursor-pointer"
              >
                加载更多（剩余 {rest}）
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={!!delistRow} onClose={() => setDelistRow(null)} title="下架模块" width={480}>
        {delistRow && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={moduleIconMap[delistRow.mod.icon] ?? moduleIconMap.building}
                alt=""
                className="w-[36px] h-[36px] object-contain shrink-0"
              />
              <div>
                <p className="text-[15px] font-medium text-text">
                  {delistRow.mod.name}（{delistRow.mod.edition}）
                </p>
                <p className="text-[13px] text-text-muted mt-[3px]">
                  {delistRow.mod.code} · {delistRow.mod.category}
                </p>
              </div>
            </div>

            <div className="bg-warning-bg rounded-md px-4 py-3 flex items-start gap-3">
              <TriangleAlert size={16} className="text-warning shrink-0 mt-[2px]" />
              <p className="text-[14px] text-text-secondary leading-[22px]">
                下架后企业无法新申请该模块，但<span className="text-text">不影响已发放的席位</span>，
                在售席位可继续使用至到期。
              </p>
            </div>

            {delistRow.soldSeats > 0 && (
              <div className="bg-danger-bg rounded-md px-4 py-3 flex items-start gap-3">
                <TriangleAlert size={16} className="text-danger shrink-0 mt-[2px]" />
                <p className="text-[14px] text-danger leading-[22px]">
                  该模块当前有 {delistRow.soldSeats} 个在售席位分布在 {delistRow.orgCount} 家企业，
                  <span className="text-text-secondary">下架后这些企业将无法继续扩容或续费，请确认已通知客户。</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setDelistRow(null)}
                className="btn-soft h-[42px] text-[14px] font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={submitDelist}
                className="h-[42px] rounded-full text-[14px] font-semibold text-white bg-danger hover:brightness-110 transition-colors cursor-pointer"
              >
                确认下架
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!priceRow} onClose={() => setPriceRow(null)} title="调整定价" width={480}>
        {priceRow && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src={moduleIconMap[priceRow.mod.icon] ?? moduleIconMap.building}
                alt=""
                className="w-[36px] h-[36px] object-contain shrink-0"
              />
              <div>
                <p className="text-[15px] font-medium text-text">
                  {priceRow.mod.name}（{priceRow.mod.edition}）
                </p>
                <p className="text-[13px] text-text-muted mt-[3px]">
                  {priceRow.mod.code} · {priceRow.mod.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-secondary rounded-md px-4 py-3">
                <p className="text-[13px] text-text-muted">当前单价</p>
                <p className="text-[20px] text-text mt-1">{money(priceRow.mod.unitPrice)}</p>
              </div>
              <div className="bg-surface-secondary rounded-md px-4 py-3">
                <p className="text-[13px] text-text-muted">调整后单价</p>
                <p className={`text-[20px] mt-1 ${priceValid ? 'text-text' : 'text-text-placeholder'}`}>
                  {priceValid ? money(priceValue) : '—'}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="price-input" className="block text-[14px] font-medium text-text mb-[6px]">
                新的席位单价（元 / 席位 / 年）
              </label>
              <input
                id="price-input"
                type="number"
                min={1}
                step={100}
                value={priceDraft}
                onChange={(e) => setPriceDraft(e.target.value)}
                className={numberInputCls}
              />
              {!priceValid && priceDraft.trim() !== '' && (
                <p className="text-[13px] text-danger mt-[6px]">请输入大于 0 的整数金额</p>
              )}
              {priceUnchanged && <p className="text-[13px] text-text-muted mt-[6px]">单价未发生变化</p>}
              {priceSubmittable && priceDelta !== 0 && (
                <p
                  className={`text-[13px] mt-[6px] inline-flex items-center gap-[4px] ${
                    priceDelta > 0 ? 'text-danger' : 'text-success'
                  }`}
                >
                  {priceDelta > 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {priceDelta > 0 ? '涨价' : '降价'} {Math.abs(priceDelta).toFixed(1)}%
                  <span className="text-text-muted">
                    （{priceDelta > 0 ? '+' : '−'}
                    {money(Math.abs(priceValue - priceRow.mod.unitPrice))}）
                  </span>
                </p>
              )}
            </div>

            <p className="text-[13px] text-text-muted leading-[20px]">
              调价只对新建订单生效，已完成订单与在售席位按原价保留。
              {priceRow.soldSeats > 0 &&
                ` 该模块已有 ${priceRow.soldSeats} 个席位分布在 ${priceRow.orgCount} 家企业，续费时将按新单价计算。`}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setPriceRow(null)}
                className="btn-soft h-[42px] text-[14px] font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={submitPrice}
                disabled={!priceSubmittable}
                className="btn-primary h-[42px] text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed"
              >
                确认调价
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
