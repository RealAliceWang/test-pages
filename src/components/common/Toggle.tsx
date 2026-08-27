interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      role="switch"
      aria-checked={enabled}
      className={`relative w-[44px] h-[26px] rounded-full cursor-pointer transition-colors duration-300 shrink-0 ${
        enabled ? 'bg-ink' : 'bg-[#D3D7DE]'
      }`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] bg-white rounded-full transition-transform duration-300 ${
          enabled ? 'translate-x-[18px]' : ''
        }`}
        style={{ transitionTimingFunction: 'var(--ease-fluid)' }}
      />
    </button>
  );
}
