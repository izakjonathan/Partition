'use client';
import { useState } from 'react';

export function UiStudio({ canvas, ink, accent }: { canvas:string; ink:string; accent:string }) {
  const [colors,setColors] = useState({canvas,ink,accent});
  const preview = {background:colors.canvas,color:colors.ink};
  return <form className="studio-form" action="/admin/api/theme" method="post"><div className="studio-fields">
    {(['canvas','ink','accent'] as const).map(key => <label key={key}><span>{({canvas:'Canvas',ink:'Ink',accent:'Accent'} as const)[key]}</span><div className="color-control"><input type="color" aria-label={`${key} color picker`} value={colors[key]} onChange={event => setColors({...colors,[key]:event.target.value})}/><input name={key} aria-label={`${key} hex color`} value={colors[key]} pattern="#[0-9A-Fa-f]{6}" maxLength={7} onChange={event => setColors({...colors,[key]:event.target.value})}/></div></label>)}
  </div><div className="studio-preview" style={preview}><small>LIVE PREVIEW</small><strong>More blues. More often.</strong><p style={{color:colors.ink}}>The public page, manager dashboard and sign-in all use these colors.</p><span style={{background:colors.accent,color:colors.ink}}>Example action ↗</span></div>
    <div className="inline"><button type="button" className="outline-button" onClick={() => setColors({canvas:'#fff4c4',ink:'#000000',accent:'#dfee4b'})}>Baros defaults</button><button type="submit">Save colors</button></div>
    <p className="hint">Readable contrast is checked when you save.</p></form>;
}
