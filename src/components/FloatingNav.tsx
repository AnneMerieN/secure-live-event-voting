"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function FloatingNav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", Icon: HomeIcon },
    { href: "/vote", label: "Vote", Icon: VoteIcon },
    { href: "/results", label: "Results", Icon: ResultsIcon },
    { href: "/admin", label: "Admin", Icon: ShieldIcon },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed top-6 left-1/2 z-50 -translate-x-1/2 px-4"
    >
      <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-surface-card/90 p-1.5 backdrop-blur-md">
        {items.map(({ href, label, Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-full px-4 py-2 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-surface-base text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12L12 3l9 9" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </svg>
  );
}

function VoteIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

function ResultsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20h16" />
      <path d="M6 16v4" />
      <path d="M12 10v10" />
      <path d="M18 14v6" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6l-8-3z" />
    </svg>
  );
}
