interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  /** Accessible name for the switch, e.g. "上架状态". */
  ariaLabel?: string;
}

export default function Toggle({ enabled, onChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      className="relative w-[44px] h-[36px] flex items-center justify-center cursor-pointer shrink-0"
    >
      <span
        className={`relative w-[44px] h-[26px] rounded-full transition-colors duration-300 ${
          enabled ? 'bg-ink' : 'bg-border-strong'
        }`}
      >
        <span
          className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] bg-white rounded-full transition-transform duration-300 ${
            enabled ? 'translate-x-[18px]' : ''
          }`}
          style={{ transitionTimingFunction: 'var(--ease-fluid)' }}
        />
      </span>
    </button>
  );
}
