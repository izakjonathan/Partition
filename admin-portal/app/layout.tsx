import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Petition admin',
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
