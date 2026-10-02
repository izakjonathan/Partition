import { db } from '@/lib/db';
import { authorized } from '@/lib/auth';
import { cityForPostcode } from '@/lib/postal-city';
import { redirect } from 'next/navigation';
import { ManagerHeader } from './manager-header';
import { ageBands } from '@/lib/age-bands';

export const dynamic = 'force-dynamic';
type PostalRow = { postal_code: string; count: number };
type AgeRow = { age: number | null; age_years: number | null; age_band: string | null; count: number };

export default async function Dashboard() {
  if (!(await authorized())) redirect('/admin/sign-in');
  if (!process.env.DATABASE_URL) return <main className="manager-shell"><ManagerHeader section="dashboard"/><section className="manager-main"><h1>Dashboard</h1><p>Database connection is missing.</p></section></main>;
  const sql = db();
  const [summaryRows, postalRows, ageRows] = await Promise.all([
    sql`SELECT count(*)::integer AS total,
      count(*) FILTER (WHERE verified_at >= now() - interval '7 days')::integer AS recent,
      count(*) FILTER (WHERE marketing_consent_at IS NOT NULL AND marketing_withdrawn_at IS NULL)::integer AS optins,
      count(*) FILTER (WHERE age_years IS NOT NULL OR age_band IS NOT NULL OR date_of_birth IS NOT NULL)::integer AS ages
      FROM interests WHERE verified_at IS NOT NULL`,
    sql`SELECT postal_code, count(*)::integer AS count FROM interests WHERE verified_at IS NOT NULL GROUP BY postal_code ORDER BY count DESC, postal_code LIMIT 8`,
    sql`SELECT date_part('year', age(current_date, date_of_birth))::integer AS age, age_years, age_band, count(*)::integer AS count
      FROM interests WHERE verified_at IS NOT NULL AND (age_years IS NOT NULL OR age_band IS NOT NULL OR date_of_birth IS NOT NULL) GROUP BY 1, 2, 3`,
  ]);
  const summary = summaryRows[0] as { total: number; recent: number; optins: number; ages: number };
  const cities = await Promise.all((postalRows as PostalRow[]).map(async row => ({ ...row, city: await cityForPostcode(row.postal_code) })));
  const ages = ageRows as AgeRow[];
  const bands = ageBands.map(band => ({ name: band.label, count: ages.reduce((sum, row) => {
    const exact = row.age_years ?? row.age;
    const matches = exact !== null ? exact >= band.min && exact <= band.max : row.age_band === band.value;
    return sum + (matches ? Number(row.count) : 0);
  }, 0) }));
  const maxCity = Math.max(1, ...cities.map(row => Number(row.count)));
  const maxAge = Math.max(1, ...bands.map(row => row.count));
  return <main className="manager-shell"><ManagerHeader section="dashboard"/><div className="manager-main">
    <div className="section-intro"><h1>Dashboard<span className="title-dot">.</span></h1></div>
    <div className="metric-grid">
      <article className="metric-card primary"><span>Confirmed responses</span><strong>{Number(summary.total).toLocaleString('da-DK')}</strong></article>
      <article className="metric-card"><span>Last 7 days</span><strong>{Number(summary.recent).toLocaleString('da-DK')}</strong></article>
      <article className="metric-card"><span>Blues email opt-ins</span><strong>{Number(summary.optins).toLocaleString('da-DK')}</strong></article>
    </div>
    <div className="insight-grid">
      <section className="insight-card"><div className="card-heading"><h2>Where support comes from</h2><span>Top postcodes</span></div>
        {cities.length ? <div className="bar-list">{cities.map(row => <div className="bar-row" key={row.postal_code}><div className="bar-label"><strong>{row.city}</strong><small>{row.postal_code}</small></div><div className="bar-track"><i style={{ width: `${Number(row.count) / maxCity * 100}%` }}/></div><b>{row.count}</b></div>)}</div> : <p className="empty-note">Locations appear after the first confirmation.</p>}
      </section>
      <section className="insight-card"><div className="card-heading"><h2>Age of supporters</h2><span>{summary.ages} with age data</span></div>
        {Number(summary.ages) ? <div className="bar-list">{bands.map(row => <div className="bar-row" key={row.name}><div className="bar-label"><strong>{row.name}</strong></div><div className="bar-track"><i style={{ width: `${row.count / maxAge * 100}%` }}/></div><b>{row.count}</b></div>)}</div> : <p className="empty-note">Ages appear when supporters choose to provide them.</p>}
      </section>
    </div>
  </div></main>;
}
