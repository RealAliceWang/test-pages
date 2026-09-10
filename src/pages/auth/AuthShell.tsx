import type { CSSProperties, ReactNode } from 'react';
import { TriangleAlert, X } from 'lucide-react';
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
          'radial-gradient(circle at 30% 26%, color-mix(in srgb, var(--color-auth-glass-highlight) 95%, transparent) 0%, color-mix(in srgb, var(--color-auth-glass-mist) 75%, transparent) 16%, color-mix(in srgb, var(--color-signal) 40%, transparent) 46%, color-mix(in srgb, var(--color-primary) 20%, transparent) 74%, color-mix(in srgb, var(--color-auth-glass-highlight) 6%, transparent) 100%)',
        boxShadow:
          'inset -14px -16px 34px color-mix(in srgb, var(--color-auth-glass-shadow) 20%, transparent), inset 8px 10px 22px color-mix(in srgb, var(--color-auth-glass-highlight) 75%, transparent), 0 26px 50px -18px color-mix(in srgb, var(--color-primary) 35%, transparent)',
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
      style={{ background: 'radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--color-signal-soft) 80%, transparent), color-mix(in srgb, var(--color-primary) 20%, transparent) 55%, transparent 78%)' }}
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
        background: 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-signal-soft) 50%, transparent), color-mix(in srgb, var(--color-primary) 16%, transparent) 60%, transparent 86%)',
      } as CSSProperties}
    >
      <div className="absolute -left-12 top-[16%] w-[120%] h-[150px] rotate-[-16deg] blur-lg"
        style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-auth-glass-current-sky) 55%, transparent), color-mix(in srgb, var(--color-auth-glass-current-sky) 12%, transparent))' }} />
      <div className="absolute -left-16 top-[44%] w-[125%] h-[130px] rotate-[-16deg] blur-lg"
        style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-auth-glass-current-mint) 50%, transparent), color-mix(in srgb, var(--color-auth-glass-current-mint) 10%, transparent))' }} />
      <div className="absolute -left-12 top-[70%] w-[120%] h-[150px] rotate-[-16deg] blur-lg"
        style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-auth-glass-current-blue) 42%, transparent), color-mix(in srgb, var(--color-auth-glass-current-blue) 8%, transparent))' }} />
    </div>
    {/* Mint under-current escaping past the hero's lower edge */}
    <div
      className="auth-blob absolute right-[4%] bottom-[4%] w-[380px] h-[300px] blur-xl opacity-75"
      style={{
        '--blob-dur': '26s',
        '--blob-rot': '-10deg',
        background: 'radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--color-success-soft) 80%, transparent), color-mix(in srgb, var(--color-signal) 35%, transparent) 60%, transparent 82%)',
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
        border: '2px solid color-mix(in srgb, var(--color-auth-glass-highlight) 65%, transparent)',
        background:
          'linear-gradient(142deg, color-mix(in srgb, var(--color-auth-glass-highlight) 62%, transparent) 0%, color-mix(in srgb, var(--color-auth-glass-mist) 40%, transparent) 38%, color-mix(in srgb, var(--color-signal) 28%, transparent) 68%, color-mix(in srgb, var(--color-primary) 16%, transparent) 100%)',
        backdropFilter: 'blur(18px) saturate(1.35)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.35)',
        boxShadow:
          'inset 8px 10px 24px color-mix(in srgb, var(--color-auth-glass-highlight) 70%, transparent), inset -14px -16px 30px color-mix(in srgb, var(--color-auth-glass-shadow) 15%, transparent), 0 48px 90px -36px color-mix(in srgb, var(--color-auth-glass-shadow) 35%, transparent)',
      } as CSSProperties}
    >
      <div
        className="absolute left-[6%] top-[3%] w-[68%] h-[24%] rounded-[50%] blur-[26px] opacity-60"
        style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-auth-glass-highlight) 95%, transparent), transparent)' }}
      />
    </div>
    {/* Grounding shadow under the subject */}
    <div
      className="absolute right-[4%] bottom-[7%] w-[440px] h-[64px] rounded-[50%] blur-2xl"
      style={{ background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-auth-glass-shadow) 16%, transparent), transparent)' }}
    />

    {/* A droplet that broke away from the flow, on the sight line between
        the card's CTA and the subject: small, near-round, with its own rim
        and specular so it reads as glass rather than a smudge. */}
    <div
      className="auth-drift absolute left-[47%] top-[55%] w-[72px] h-[70px] rounded-[52%_48%_50%_50%/50%_52%_48%_52%]"
      style={{
        '--drift-dur': '12s',
        border: '1px solid color-mix(in srgb, var(--color-auth-glass-highlight) 70%, transparent)',
        background:
          'linear-gradient(150deg, color-mix(in srgb, var(--color-auth-glass-highlight) 75%, transparent), color-mix(in srgb, var(--color-signal) 45%, transparent) 58%, color-mix(in srgb, var(--color-primary) 20%, transparent) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: 'inset 4px 5px 12px color-mix(in srgb, var(--color-auth-glass-highlight) 75%, transparent), inset -6px -8px 16px color-mix(in srgb, var(--color-auth-glass-shadow) 14%, transparent), 0 20px 36px -14px color-mix(in srgb, var(--color-auth-glass-shadow) 30%, transparent)',
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
    <div className="h-dvh">
      <div className="app-shell relative h-full overflow-hidden">
        {scene}

        {/* Wide screens: the card keeps to the left and the subject owns the
            right; below xl the card recentres over the same scene. Content
            scrolls inside this column rather than the window if it ever
            outgrows the viewport. */}
        <div className="relative z-10 h-full flex items-center justify-center xl:justify-start xl:pl-[11%] p-6 overflow-y-auto">
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
              className="auth-card panel px-6 py-6 border border-white/60"
              style={{
                background: 'color-mix(in srgb, var(--color-auth-glass-highlight) 62%, transparent)',
                backdropFilter: 'blur(24px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
                boxShadow:
                  '0 32px 64px -24px color-mix(in srgb, var(--color-auth-glass-shadow) 22%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-auth-glass-highlight) 90%, transparent)',
              }}
            >
              {flash && flash.kind === 'error' && (
                <div role="alert" className="mb-5 px-4 py-3 rounded-md bg-danger-bg flex items-start gap-3">
                  <TriangleAlert size={16} className="text-danger shrink-0 mt-[2px]" />
                  <p className="flex-1 text-danger text-[13px] font-medium leading-relaxed">{flash.text}</p>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'DISMISS_FLASH' })}
                    aria-label="关闭"
                    className="btn-icon w-9 h-9 -my-1 -mr-1 shrink-0 cursor-pointer"
                  >
                    <X size={14} strokeWidth={2.2} />
                  </button>
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
