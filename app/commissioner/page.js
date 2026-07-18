'use client';

import { useMemo, useState } from 'react';
import { draftOptions } from '../../lib/draftOptions';

export default function CommissionerPage() {
  const [password, setPassword] = useState('');
  const [responses, setResponses] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  async function loadResponses(event) {
    if (event) event.preventDefault();
    setLoading(true); setStatus('');
    try {
      const response = await fetch('/api/responses', { headers: { 'x-admin-password': password }, cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error === 'Unauthorized' ? 'Incorrect commissioner password.' : data.error);
      setResponses(data.responses || []); setAuthenticated(true);
    } catch (error) { setStatus(error.message); setAuthenticated(false); }
    finally { setLoading(false); }
  }

  async function deleteResponse(id, name) {
    if (!window.confirm(`Delete ${name}'s response?`)) return;
    const response = await fetch('/api/responses', { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'x-admin-password': password }, body: JSON.stringify({ id }) });
    if (response.ok) setResponses((current) => current.filter((item) => item.id !== id));
  }

  const rankings = useMemo(() => draftOptions.map((option) => {
    let great = 0, work = 0, cant = 0;
    responses.forEach((response) => {
      const value = response.availability?.[option.id];
      if (value === 'great') great++;
      else if (value === 'work') work++;
      else cant++;
    });
    return { ...option, great, work, cant, available: great + work, points: great * 2 + work };
  }).sort((a, b) => b.available - a.available || a.cant - b.cant || b.points - a.points || b.great - a.great), [responses]);

  function exportCsv() {
    const headers = ['Name', ...draftOptions.map((o) => o.label), 'Participation', 'Comments', 'Updated'];
    const rows = responses.map((r) => [r.name, ...draftOptions.map((o) => r.availability?.[o.id] || ''), r.participation_mode, r.comments || '', r.updated_at]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'fantasy-fools-draft-responses.csv'; a.click(); URL.revokeObjectURL(url);
  }

  if (!authenticated) return (
    <main className="admin-shell"><section className="login-card"><span className="eyebrow">Fantasy Fools</span><h1>Commissioner&apos;s War Room</h1><p>Enter the commissioner password set in Vercel.</p><form onSubmit={loadResponses}><input className="text-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Commissioner password" required /><button className="submit-button" disabled={loading}>{loading ? 'OPENING...' : 'ENTER WAR ROOM'}</button></form>{status && <div className="status-message error">{status}</div>}<a href="/">← Back to survey</a></section></main>
  );

  const inPerson = responses.filter((r) => r.participation_mode === 'in-person').length;
  const remote = responses.length - inPerson;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header"><div><span className="eyebrow">Commissioner&apos;s War Room</span><h1>Fantasy Fools Results</h1><p>{responses.length} owner response{responses.length === 1 ? '' : 's'} received</p></div><div className="dashboard-actions"><button onClick={() => loadResponses()}>Refresh</button><button onClick={exportCsv}>Export CSV</button><a href="/">Survey</a></div></header>
      <section className="metric-grid"><div><strong>{responses.length}</strong><span>Total responses</span></div><div><strong>{inPerson}</strong><span>In person</span></div><div><strong>{remote}</strong><span>Remote</span></div><div><strong>{rankings[0]?.available || 0}</strong><span>Best-slot availability</span></div></section>
      <section className="dashboard-card"><h2>Best Draft Times</h2><p className="dashboard-note">Ranked first by number of owners who can attend, then by preference points.</p><div className="ranking-list">{rankings.map((item, index) => <div className={`ranking-row ${index === 0 ? 'winner' : ''}`} key={item.id}><div className="rank-number">{index + 1}</div><div className="rank-label"><strong>{item.label}</strong><span>{item.available}/{responses.length} available • {item.points} preference points</span></div><div className="rank-counts"><span>🟢 {item.great}</span><span>🟡 {item.work}</span><span>🔴 {item.cant}</span></div></div>)}</div></section>
      <section className="dashboard-card"><h2>Owner Responses</h2><div className="response-grid">{responses.map((response) => <article className="owner-card" key={response.id}><div className="owner-card-header"><div><h3>{response.name}</h3><span>{response.participation_mode === 'in-person' ? '🏠 Drafting in person' : '💻 Drafting remotely'}</span></div><button className="delete-button" onClick={() => deleteResponse(response.id, response.name)}>Delete</button></div><div className="owner-availability">{draftOptions.map((option) => <div key={option.id}><span>{option.label}</span><strong>{response.availability?.[option.id] === 'great' ? '🟢 Great' : response.availability?.[option.id] === 'work' ? '🟡 Can work' : '🔴 Cannot'}</strong></div>)}</div>{response.comments && <blockquote>“{response.comments}”</blockquote>}</article>)}</div></section>
    </main>
  );
}
