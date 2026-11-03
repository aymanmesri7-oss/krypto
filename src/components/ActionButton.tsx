import Link from "next/link";

export default function ActionButton({
  href,
  onClick,
  label,
  icon,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  const body = (
    <>
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-kb-blue text-white transition-transform active:scale-95">
        {icon}
      </span>
      <span className="text-[13px] font-medium">{label}</span>
    </>
  );
  const className = "flex flex-col items-center gap-2";
  if (href) return <Link href={href} className={className}>{body}</Link>;
  return <button type="button" onClick={onClick} className={className}>{body}</button>;
}
