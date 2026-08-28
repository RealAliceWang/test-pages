import type { CSSProperties, ReactNode } from 'react';
import { moduleIconMap } from '../../assets/moduleIcons';
import { useApp } from '../../store';

/* ---- The C4D-style backdrop -------------------------------------------
   A soft-rendered 3D set built from what the product already owns: the
   glass module icons float as oversized set pieces (a space-frame shell,
   a high-rise, a tower — the things this software designs), between glass
   spheres faked with radial gradients + inset shadows. Depth comes from
   blur (far pieces soft, near pieces crisp) and from drift speeds — far
   things move slower. Everything is aria-hidden and pointer-transparent. */

/** A glassy sphere: specular highlight up-left, refractive shadow down-right. */
function GlassOrb({ size, className, style }: { size: number; className?: string; style?: CSSProperties }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-full ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 26%, rgba(255,255,255,.95) 0%, rgba(219,239,254,.75) 16%, rgba(125,211,252,.4) 46%, rgba(47,107,255,.2) 74%, rgba(255,255,255,.06) 100%)',
        boxShadow:
          'inset -14px -16px 34px rgba(29,78,216,.2), inset 8px 10px 22px rgba(255,255,255,.75), 0 26px 50px -18px rgba(47,107,255,.35)',
        ...style,
      }}
    />
  );
}

/** Soft contact shadow that grounds a floating piece onto the backdrop. */
function ContactShadow({ width, className }: { width: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute rounded-[50%] blur-xl ${className ?? ''}`}
      style={{
        width,
        height: Math.round(width * 0.16),
        background: 'radial-gradient(closest-side, rgba(29,78,216,.18), transparent)',
      }}
    />
  );
}

const scene = (
  <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    {/* Ambient colour fields, like studio bounce light */}
    <div
      className="absolute -top-44 -left-36 w-[560px] h-[560px] rounded-full blur-3xl opacity-80"
      style={{ background: 'radial-gradient(circle at 35% 30%, rgba(186,230,253,.9), rgba(47,107,255,.28) 55%, transparent 78%)' }}
    />
    <div
      className="absolute -bottom-36 -right-24 w-[520px] h-[520px] rounded-full blur-3xl opacity-80"
      style={{ background: 'radial-gradient(circle at 40% 35%, rgba(167,243,208,.95), rgba(125,211,252,.35) 60%, transparent 80%)' }}
    />

    {/* Pieces tucked behind the frosted card, so the glass has something to
        actually frost: a colour blob and a sphere ghosting through its edge. */}
    <div
      className="absolute left-1/2 top-1/2 w-[360px] h-[300px] rounded-full blur-2xl opacity-70"
      style={{
        transform: 'translate(-8%, -18%)',
        background: 'radial-gradient(circle at 40% 40%, rgba(125,211,252,.55), rgba(167,243,208,.35) 55%, transparent 78%)',
      }}
    />
    <GlassOrb size={120} className="left-1/2 top-1/2" style={{ transform: 'translate(150px, 120px)' }} />
    {/* Tiny specular on the sliver of that orb which escapes the card, so the
        exposed part reads as glass rather than a stray soft blob. */}
    <div
      className="absolute left-1/2 top-1/2 w-[10px] h-[10px] rounded-full"
      style={{ transform: 'translate(208px, 152px)', background: 'rgba(255,255,255,.95)', filter: 'blur(2.5px)' }}
    />

    {/* Near plane: the space-frame shell — big, crisp, bleeding off the edge */}
    <ContactShadow width={250} className="right-[2%] top-[40%]" />
    <img
      src={moduleIconMap.grid}
      alt=""
      className="auth-drift absolute right-[-3%] top-[13%] w-[265px] opacity-90"
      style={{
        '--drift-dur': '12s',
        '--drift-rot': '-9deg',
        filter: 'drop-shadow(0 24px 48px rgba(37,99,235,.16)) saturate(1.05)',
      } as CSSProperties}
    />
    {/* Mid plane: the high-rise, visibly out of focus and a step smaller */}
    <ContactShadow width={150} className="left-[10%] bottom-[10%] opacity-80" />
    <img
      src={moduleIconMap.layers}
      alt=""
      className="auth-drift absolute left-[9%] bottom-[14%] w-[158px] opacity-80"
      style={{
        '--drift-dur': '15s',
        '--drift-rot': '7deg',
        filter: 'blur(2.6px) drop-shadow(0 20px 32px rgba(37,99,235,.14))',
      } as CSSProperties}
    />
    {/* Far plane: the tower, deep in the depth of field */}
    <img
      src={moduleIconMap.bridge}
      alt=""
      className="auth-drift absolute left-[24%] top-[9%] w-[110px] opacity-60"
      style={{
        '--drift-dur': '18s',
        '--drift-rot': '-5deg',
        filter: 'blur(6px) drop-shadow(0 18px 26px rgba(29,78,216,.14))',
      } as CSSProperties}
    />

    {/* Glass spheres punctuating the set; size and blur agree about depth */}
    <ContactShadow width={90} className="right-[18.5%] bottom-[12.5%]" />
    <GlassOrb size={96} className="auth-drift right-[19%] bottom-[17%]" style={{ '--drift-dur': '11s' } as CSSProperties} />
    <GlassOrb size={34} className="auth-drift left-[19%] top-[30%]" style={{ '--drift-dur': '14s' } as CSSProperties} />
    <GlassOrb size={20} className="right-[31%] top-[12%] opacity-70" style={{ filter: 'blur(2px)' }} />
  </div>
);

/**
 * Full-viewport chrome for /login and /register: the product's ambient shell
 * without the sidebar or task rail, one frosted panel floating in a soft
 * 3D set. FlashToast lives inside the app Layout, so auth pages surface
 * reducer errors themselves through the inline banner below.
 */
export default function AuthShell({ width = 440, children }: { width?: number; children: ReactNode }) {
  const { state, dispatch } = useApp();
  const flash = state.flash;

  return (
    <div className="app-shell relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {scene}

      <div className="relative w-full" style={{ maxWidth: width }}>
        {/* Brand above the panel — a single stacked lockup. Two segments with
            a divider read like a 登录/注册 tab pair in this position, so the
            product name sits under the logotype instead of beside it. */}
        <div className="flex flex-col items-center gap-1 mb-6 select-none">
          <span className="text-[26px] font-extrabold tracking-[-0.035em] text-text leading-none">3D3S</span>
          <span className="text-[13px] text-text-muted tracking-[0.22em] ml-[0.22em]">云授权系统</span>
        </div>

        {/* Frosted card: the scene reads through its edges, which is what
            sells the glass — a solid panel here would flatten the set. */}
        <div
          className="panel px-8 py-8 border border-white/60"
          style={{
            background: 'rgba(255,255,255,.6)',
            backdropFilter: 'blur(24px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
            boxShadow: '0 32px 64px -24px rgba(29,78,216,.22), inset 0 1px 0 rgba(255,255,255,.9)',
          }}
        >
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
