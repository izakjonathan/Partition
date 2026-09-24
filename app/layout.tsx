import type { Metadata } from 'next';
import './styles.css';

export const metadata: Metadata = {
  title: 'Petition',
  description: 'Read and support a petition',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
