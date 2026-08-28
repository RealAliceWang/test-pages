import type { CSSProperties, ReactNode } from 'react';
import { useApp } from '../../store';

/* ---- The fluid-glass backdrop ------------------------------------------
   A light studio ground with one hero subject parked on the right: a stack
   of slowly re-flowing liquid shapes. The front blob carries a real
   backdrop-filter, so it genuinely frosts the colour flows behind it — the
   glass is physical, not painted. The card keeps to the left on wide
   screens so the subject owns its side, and recentres on narrow ones.
   Everything decorative is aria-hidden and pointer-transparent. */

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

const scene = (
  <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none select-none">
    {/* Soft ambient fields keeping the left half airy and lit */}
    <div
      className="absolute -top-48 -left-40 w-[560px] h-[560px] rounded-full blur-3xl opacity-70"
      style={{ background: 'radial-gradient(circle at 35% 30%, rgba(186,230,253,.8), rgba(47,107,255,.2) 55%, transparent 78%)' }}
    />

    {/* ---- Hero subject, right side ---- */}
    {/* Rear current: banded colour flows inside a re-flowing silhouette. The
        bands are what give the front glass something visible to frost — a
        flat gradient blurs into itself and proves nothing. The silhouette
        deliberately overshoots the front body on three sides so the two
        layers never read as one concentric halo. */}
    <div
      className="auth-blob absolute right-[-16%] top-[-2%] w-[880px] h-[810px] opacity-90 overflow-hidden blur-[5px]"
      style={{
        '--blob-dur': '30s',
        '--blob-rot': '8deg',
        background: 'radial-gradient(circle at 30% 30%, rgba(186,230,253,.5), rgba(47,107,255,.16) 60%, transparent 86%)',
      } as CSSProperties}
    >
      <div className="absolute -left-12 top-[16%] w-[120%] h-[150px] rotate-[-16deg] blur-lg"
        style={{ background: 'linear-gradient(90deg, rgba(96,165,250,.55), rgba(96,165,250,.12))' }} />
      <div className="absolute -left-16 top-[44%] w-[125%] h-[130px] rotate-[-16deg] blur-lg"
        style={{ background: 'linear-gradient(90deg, rgba(110,231,183,.5), rgba(110,231,183,.1))' }} />
      <div className="absolute -left-12 top-[70%] w-[120%] h-[150px] rotate-[-16deg] blur-lg"
        style={{ background: 'linear-gradient(90deg, rgba(59,130,246,.42), rgba(59,130,246,.08))' }} />
    </div>
    {/* Mint under-current escaping past the hero's lower edge */}
    <div
      className="auth-blob absolute right-[4%] bottom-[4%] w-[380px] h-[300px] blur-xl opacity-75"
      style={{
        '--blob-dur': '26s',
        '--blob-rot': '-10deg',
        background: 'radial-gradient(circle at 40% 40%, rgba(167,243,208,.8), rgba(125,211,252,.35) 60%, transparent 82%)',
      } as CSSProperties}
    />
    {/* Front flow: the frosted-glass body itself. Crisp 2px rim + a crescent
        specular along the inner top-left edge — the "crisp front, soft back"
        contrast is what sells the refraction. */}
    <div
      className="auth-blob absolute right-[2%] top-[16%] w-[520px] h-[560px] overflow-hidden"
      style={{
        '--blob-dur': '20s',
        '--blob-rot': '-4deg',
        border: '2px solid rgba(255,255,255,.65)',
        background:
          'linear-gradient(142deg, rgba(255,255,255,.62) 0%, rgba(219,239,254,.4) 38%, rgba(125,211,252,.28) 68%, rgba(47,107,255,.16) 100%)',
        backdropFilter: 'blur(18px) saturate(1.35)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.35)',
        boxShadow:
          'inset 8px 10px 24px rgba(255,255,255,.7), inset -14px -16px 30px rgba(29,78,216,.15), 0 48px 90px -36px rgba(29,78,216,.35)',
      } as CSSProperties}
    >
      <div
        className="absolute left-[6%] top-[3%] w-[68%] h-[24%] rounded-[50%] blur-[26px] opacity-60"
        style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,.95), transparent)' }}
      />
    </div>
    {/* Grounding shadow under the subject */}
    <div
      className="absolute right-[4%] bottom-[7%] w-[440px] h-[64px] rounded-[50%] blur-2xl"
      style={{ background: 'radial-gradient(closest-side, rgba(29,78,216,.16), transparent)' }}
    />

    {/* A droplet that broke away from the flow, on the sight line between
        the card's CTA and the subject: small, near-round, with its own rim
        and specular so it reads as glass rather than a smudge. */}
    <div
      className="auth-drift absolute left-[47%] top-[55%] w-[72px] h-[70px] rounded-[52%_48%_50%_50%/50%_52%_48%_52%]"
      style={{
        '--drift-dur': '12s',
        border: '1px solid rgba(255,255,255,.7)',
        background:
          'linear-gradient(150deg, rgba(255,255,255,.75), rgba(125,211,252,.45) 58%, rgba(47,107,255,.2) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'inset 4px 5px 12px rgba(255,255,255,.75), inset -6px -8px 16px rgba(29,78,216,.14), 0 20px 36px -14px rgba(29,78,216,.3)',
      } as CSSProperties}
    >
      <div className="absolute left-[20%] top-[14%] w-[11px] h-[9px] rounded-full bg-white opacity-70"
        style={{ filter: 'blur(1px)' }} />
    </div>

    {/* Small glass beads riding the current */}
    <GlassOrb size={54} className="auth-drift right-[30%] top-[13%]" style={{ '--drift-dur': '13s' } as CSSProperties} />
    <GlassOrb size={22} className="auth-drift right-[13%] bottom-[26%]" style={{ '--drift-dur': '11s' } as CSSProperties} />
    <GlassOrb size={16} className="left-[30%] top-[18%] opacity-70" style={{ filter: 'blur(2px)' }} />
  </div>
);

/**
 * Full-viewport chrome for /login and /register: the product's ambient shell
 * without the sidebar or task rail, one frosted panel beside a fluid-glass
 * subject. FlashToast lives inside the app Layout, so auth pages surface
 * reducer errors themselves through the inline banner below.
 */
export default function AuthShell({ width = 440, children }: { width?: number; children: ReactNode }) {
  const { state, dispatch } = useApp();
  const flash = state.flash;

  return (
    <div className="app-shell relative min-h-screen overflow-hidden">
      {scene}

      {/* Wide screens: the card keeps to the left and the subject owns the
          right; below xl the card recentres over the same scene. */}
      <div className="relative z-10 min-h-screen flex items-center justify-center xl:justify-start xl:pl-[11%] p-6">
        <div className="w-full" style={{ maxWidth: width }}>
          {/* Brand above the panel — a single stacked lockup. Two segments with
              a divider read like a 登录/注册 tab pair in this position, so the
              product name sits under the logotype instead of beside it. */}
          <div className="flex flex-col items-center gap-1 mb-6 select-none">
            <span className="text-[26px] font-extrabold tracking-[-0.035em] text-text leading-none">3D3S</span>
            <span className="text-[13px] text-text-muted tracking-[0.22em] ml-[0.22em]">云授权系统</span>
          </div>

          {/* Frosted card: translucent enough that the stray droplet and the
              ambient colour read through its surface. */}
          <div
            className="panel px-8 py-8 border border-white/60"
            style={{
              background: 'rgba(255,255,255,.62)',
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
    </div>
  );
}
