export default function AIBadge({ size = 'sm' }) {
  return (
    <span className={`
      bg-[#9D72FF] text-white font-body font-bold rounded tracking-wide
      ${size === 'sm' ? 'text-[10px] px-2 py-[3px]' : 'text-xs px-2.5 py-1'}
    `}>
      AI
    </span>
  );
}
