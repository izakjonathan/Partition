'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ageBands } from '@/lib/age-bands';

export type ResponseRow = {
  id: string; full_name: string; email: string; postal_code: string; date_of_birth: string | null; age_band: string | null; age_years: number | null;
  created_at: string; verified_at: string; privacy_version: string; statement_revision: string;
  statement_snapshot: string; marketing_consent_at: string | null; marketing_withdrawn_at: string | null;
};
type Key = 'verified_at' | 'full_name' | 'email' | 'postal_code' | 'age_years' | 'marketing_consent_at' | 'statement_revision' | 'privacy_version';
const columns: { key: Key; label: string; placeholder: string }[] = [
  { key: 'verified_at', label: 'Confirmed', placeholder: 'Date' },
  { key: 'full_name', label: 'Name', placeholder: 'Name' },
  { key: 'email', label: 'Email', placeholder: 'Email' },
  { key: 'postal_code', label: 'City / postcode', placeholder: 'City or code' },
  { key: 'age_years', label: 'Age', placeholder: 'Age' },
  { key: 'marketing_consent_at', label: 'Blues emails', placeholder: 'Yes or no' },
  { key: 'statement_revision', label: 'Statement', placeholder: 'Version' },
  { key: 'privacy_version', label: 'Privacy', placeholder: 'Version' },
];
function age(date: string | null) {
  if (!date) return null;
  const birth = new Date(`${date}T00:00:00Z`);
  const now = new Date();
  let result = now.getUTCFullYear() - birth.getUTCFullYear();
  if (now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())) result--;
  return result;
}
function ageValue(row: ResponseRow) {
  if (row.age_years !== null) return `${row.age_years} years`;
  if (row.age_band) return ageBands.find(band => band.value === row.age_band)?.label || row.age_band;
  if (row.date_of_birth) return `${age(row.date_of_birth)} years`;
  return 'Not provided';
}

export function ResponsesTable({ rows, cities, optinEmails }: { rows: ResponseRow[]; cities: Record<string,string>; optinEmails: string[] }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Partial<Record<Key,string>>>({});
  const [sort, setSort] = useState<{ key: Key; direction: 'asc' | 'desc' }>({ key: 'verified_at', direction: 'desc' });
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const deletedEmails = new Set(rows.filter(row => deletedIds.includes(row.id)).map(row => row.email));
  const availableOptins = optinEmails.filter(email => !deletedEmails.has(email));
  const value = (row: ResponseRow, key: Key) => {
    if (key === 'postal_code') return `${cities[row.postal_code] || ''} ${row.postal_code}`;
    if (key === 'age_years') return ageValue(row);
    if (key === 'marketing_consent_at') return row.marketing_consent_at && !row.marketing_withdrawn_at ? 'Yes' : 'No';
    return String(row[key] ?? '');
  };
  const filtered = useMemo(() => rows.filter(row => !deletedIds.includes(row.id) && columns.every(({ key }) => value(row,key).toLocaleLowerCase('da-DK').includes((filters[key] || '').trim().toLocaleLowerCase('da-DK'))))
    .sort((a,b) => {
      const left = value(a,sort.key), right = value(b,sort.key);
      const result = left.localeCompare(right,'da-DK',{numeric:true,sensitivity:'base'});
      return (sort.direction === 'asc' ? result : -result) || a.id.localeCompare(b.id);
    }), [rows, cities, filters, sort, deletedIds]);
  const pages = Math.max(1,Math.ceil(filtered.length / 50));
  const visible = filtered.slice((Math.min(page,pages)-1)*50,Math.min(page,pages)*50);
  async function copyEmails() {
    try { await navigator.clipboard.writeText(availableOptins.join('; ')); setCopied(true); window.setTimeout(() => setCopied(false),3000); }
    catch { setCopied(false); }
  }
  async function deleteResponse(row: ResponseRow) {
    if (!window.confirm(`Delete ${row.full_name}'s response permanently? It will also be removed from totals and email opt-ins.`)) return;
    setDeletingId(row.id);
    setDeleteError('');
    try {
      const response = await fetch('/admin/api/responses/delete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: row.id }),
      });
      if (!response.ok) throw new Error(await response.text());
      setDeletedIds(ids => [...ids, row.id]);
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Could not delete this response. Please try again.');
    } finally { setDeletingId(null); }
  }
  return <section className="responses-section"><div className="responses-toolbar"><h2>All responses <span className="response-count">{filtered.length.toLocaleString('da-DK')}</span></h2>
    <button className="pill-button" type="button" onClick={copyEmails} disabled={!availableOptins.length}>{copied ? 'Copied ✓' : `Copy opt-ins (${availableOptins.length})`}</button></div>
    {deleteError && <p className="error-banner" role="alert">{deleteError}</p>}
    <div className="table-wrap"><table className="response-table"><thead><tr>{columns.map(({key,label,placeholder}) => <th key={key} scope="col"><span>{label}</span><details className="column-filter"><summary aria-label={`Filter and sort ${label}`}>Filter {(filters[key] || sort.key === key) && <i aria-hidden="true">•</i>} <span aria-hidden="true">⌄</span></summary><div className="filter-fields"><input type="search" aria-label={`Filter ${label}`} placeholder={placeholder} value={filters[key] || ''} onChange={e => {setFilters({...filters,[key]:e.target.value});setPage(1);}}/><div className="sort-buttons"><button type="button" aria-label={`Sort ${label} up`} aria-pressed={sort.key === key && sort.direction === 'asc'} onClick={() => {setSort({key,direction:'asc'});setPage(1);}}>↑ Up</button><button type="button" aria-label={`Sort ${label} down`} aria-pressed={sort.key === key && sort.direction === 'desc'} onClick={() => {setSort({key,direction:'desc'});setPage(1);}}>↓ Down</button></div></div></details></th>)}<th scope="col">Actions</th></tr></thead>
      <tbody>{visible.map(row => <tr key={row.id}><td>{row.verified_at.slice(0,10)}</td><td><strong>{row.full_name}</strong></td><td>{row.email}</td><td>{cities[row.postal_code] || 'Unknown'}<small>{row.postal_code}</small></td><td>{ageValue(row)}{row.age_years === null && row.date_of_birth && !row.age_band && <small>{row.date_of_birth}</small>}</td><td>{row.marketing_consent_at && !row.marketing_withdrawn_at ? 'Yes' : 'No'}</td><td><details><summary>Version {row.statement_revision}</summary><div className="statement">{row.statement_snapshot}</div></details></td><td>{row.privacy_version}</td><td><button className="delete-response" type="button" disabled={deletingId !== null} onClick={() => deleteResponse(row)} aria-label={`Delete response from ${row.full_name}`}>{deletingId === row.id ? 'Deleting…' : 'Delete'}</button></td></tr>)}</tbody></table></div>
    {!visible.length && <div className="empty-note">{rows.length > deletedIds.length ? 'No responses match these filters.' : 'No responses yet.'}</div>}
    {pages > 1 && <nav className="pager" aria-label="Responses pagination"><button type="button" disabled={page <= 1} onClick={() => setPage(page-1)}>← Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage(page+1)}>Next →</button></nav>}
  </section>;
}
