export function ManagerHeader({ section }: { section: 'dashboard' | 'responses' | 'settings' }) {
  return <header className="manager-header"><a className="wordmark" href="/admin"><span>Blågårds</span><strong>Apotek</strong><small>Manager</small></a>
    <nav className="manager-nav" aria-label="Manager navigation">
      <a href="/admin" aria-current={section === 'dashboard' ? 'page' : undefined}>Dashboard</a>
      <a href="/admin/responses" aria-current={section === 'responses' ? 'page' : undefined}>Responses</a>
      <a href="/admin/settings" aria-current={section === 'settings' ? 'page' : undefined}>Settings</a>
    </nav></header>;
}
