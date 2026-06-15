import { FloatingNav } from "./FloatingNav";

export function PageShell({
  children,
  hideNav = false,
}: {
  children: React.ReactNode;
  hideNav?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNav && <FloatingNav />}
      <main className="flex-1 pt-28">{children}</main>
    </div>
  );
}
