import { useEffect } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { useApp } from '../../store';

/* Toast is an ink surface: it must clearly out-rank the page it floats over. */
const styles = {
  success: { icon: CheckCircle2, fg: 'text-success-light' },
  error: { icon: XCircle, fg: 'text-danger-light' },
  info: { icon: Info, fg: 'text-primary-light' },
} as const;

export default function FlashToast() {
  const { state, dispatch } = useApp();
  const flash = state.flash;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => dispatch({ type: 'DISMISS_FLASH' }), 3600);
    return () => clearTimeout(t);
  }, [flash, dispatch]);

  if (!flash) return null;
  const s = styles[flash.kind];

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] pointer-events-none" role="status" aria-live="polite">
      <div
        className="rise flex items-center gap-[10px] max-w-[560px] rounded-full bg-ink pl-[16px] pr-[22px] py-[13px]"
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        <s.icon size={17} className={`${s.fg} shrink-0`} strokeWidth={2.3} />
        <p className="text-[13.5px] text-white font-medium leading-snug">{flash.text}</p>
      </div>
    </div>
  );
}
