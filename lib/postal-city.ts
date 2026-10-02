import 'server-only';

const localNames: Record<string, string> = {
  '2000': 'Frederiksberg', '2100': 'København Ø', '2200': 'København N',
  '2300': 'København S', '2400': 'København NV', '2450': 'København SV',
  '2500': 'Valby', '2600': 'Glostrup', '2610': 'Rødovre', '2700': 'Brønshøj',
  '2720': 'Vanløse', '2800': 'Kongens Lyngby', '2900': 'Hellerup',
};

export async function cityForPostcode(code: string): Promise<string> {
  if (!/^\d{4}$/.test(code)) return 'Ukendt by';
  try {
    const response = await fetch(`https://api.dataforsyningen.dk/postnumre/${code}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(2500),
    });
    if (response.ok) {
      const data = await response.json() as { navn?: string };
      if (data.navn) return data.navn;
    }
  } catch { /* Show a known local name or the post code if the lookup is unavailable. */ }
  const nr = Number(code);
  if (nr >= 1000 && nr <= 1499) return 'København K';
  if (nr >= 1500 && nr <= 1799) return 'København V';
  if (nr >= 1800 && nr <= 1999) return 'Frederiksberg C';
  return localNames[code] || `Postnummer ${code}`;
}
