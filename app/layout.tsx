import type { Metadata } from 'next';
import './styles.css';
import { petitionSettings } from '@/lib/settings';
import type { CSSProperties } from 'react';

export const metadata: Metadata = {
  title: 'Blues på Blågårds Apotek',
  description: 'Vis din støtte til flere blueskoncerter på Blågårds Apotek',
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await petitionSettings();
  const theme = { '--canvas': settings?.canvas_color || '#fff4c4', '--ink': settings?.ink_color || '#000000', '--accent': settings?.accent_color || '#dfee4b' } as CSSProperties;
  return <html lang="da" style={theme}><body>{children}</body></html>;
}
