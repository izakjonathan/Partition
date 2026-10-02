import { config } from '@/lib/config';
import { InterestForm } from './interest-form';

export const dynamic = 'force-dynamic';
export default async function Home() {
  const c = await config();
  const statement = c.statement.replace(/^Flere blues-koncerter på Blågårds Apotek 🎸\n/, '');
  return <main className="public-shell"><header className="public-header"><a className="wordmark" href="/"><span>Blågårds</span><strong>Apotek</strong></a><a className="header-link" href="/admin/sign-in">Manager ↗</a></header>
    <div className="public-content"><section className="petition-hero"><p className="eyebrow">Blågårds Apotek · København N</p><h1>Mere blues på Apoteket!</h1><p>Støt forslaget om faste blueskoncerter på Blågårds Apotek. Det tager kun et øjeblik at vise din interesse.</p><a className="pill-button" href="#stot">Vis din støtte <span aria-hidden="true">↘</span></a></section>
      <section className="petition-panel"><div><p className="eyebrow">Det du støtter</p><h2>{c.title || 'Forslaget kommer snart'}</h2><div className="statement">{statement || 'Den fulde tekst bliver offentliggjort her, før tilmeldingen åbner.'}</div>{c.revision && <p className="version-note">Offentliggjort version {c.revision}</p>}</div></section>
      <section className="signup-panel" id="stot"><div><h2>Gør din stemme<br/>hørt<span className="accent-dot">.</span></h2><p>Vi sender et link, så du kan bekræfte din e-mail. Først derefter tæller din støtte med.</p></div><div className="signup-form-wrap">{c.ready ? <InterestForm dob={c.dob} dobPurpose={c.dobPurpose}/> : <p className="closed-notice">Tilmeldingen er ikke åben endnu. Vend tilbage, når forslaget er klar.</p>}</div></section>
    </div><footer className="public-footer"><span>Blågårds Apotek · København N</span><nav><a href="/privacy">Privatliv</a><a href="/admin/sign-in">Manager</a></nav></footer>
  </main>;
}
