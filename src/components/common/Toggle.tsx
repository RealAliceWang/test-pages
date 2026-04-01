interface ToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-[40px] h-[22px] rounded-full transition-colors duration-200 ${
        enabled ? 'bg-[#1C71D8]' : 'bg-[#C9CDD4]'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${
          enabled ? 'translate-x-[18px]' : ''
        }`}
      />
    </button>
  );
}
