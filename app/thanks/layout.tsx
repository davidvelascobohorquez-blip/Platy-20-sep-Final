// app/thanks/layout.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function ThanksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
