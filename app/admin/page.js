'use client';

import { useMemo, useState } from 'react';
import { draftOptions } from '../../lib/options';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadResponses() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/responses', { headers: { 'x-admin-password': password } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load results.');
      setResponses(data.responses || []); setLoaded(true);
    } catch (e) { setError(e.message); setLoaded(false); }
    finally { setLoading(false); }
  }

  const rankings = useMemo(() => draftOptions.map((option) => {
    let great = 0, workable = 0, no = 0;
    responses.forEach((response) => {
      const answer = response.answers?.[option.id];
      if (answer === 'great') great++;
      else if (answer === 'workable') workable++;
      else if (answer === 'no') no++;
    });
    return { ...option, great, workable, no, available: great + workable, score: great * 2 + workable };
  }).sort((a, b) => b.available - a.available || b.score - a.score || b.great - a.great), [responses]);

  function exportCsv() {
    const headers = ['Name', ...draftOptions.map((o) => o.label), 'Draft Method', 'Comments', 'Last Updated'];
    const rows = responses.map((r) => [r.name, ...draftOptions.map((o) => r.answers?.[o.id] || ''), r.attendance, r.comments || '', r.updated_at]);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'fantasy-fools-responses.csv'; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <main className="admin-main">
      <div className="admin-header"><div><span className="eyebrow">Fantasy Fools</span><h1>Commissioner's War Room</h1></div><a href="/">Back to survey</a></div>
      <section className="login-card">
        <label>Commissioner password</label>
        <div><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadResponses()} /><button onClick={loadResponses} disabled={loading}>{loading ? 'Loading...' : 'View Results'}</button></div>
        {error && <p className="admin-error">{error}</p>}
      </section>

      {loaded && <>
        <section className="stats-row"><div><strong>{responses.length}</strong><span>Responses</span></div><div><strong>{responses.filter((r) => r.attendance === 'in_person').length}</strong><span>In Person</span></div><div><strong>{responses.filter((r) => r.attendance === 'remote').length}</strong><span>Remote</span></div></section>
        <section className="results-card"><div className="section-heading"><h2>Best Draft Times</h2><button onClick={exportCsv}>Export CSV</button></div>
          <div className="table-wrap"><table><thead><tr><th>Rank</th><th>Date & Time</th><th>Available</th><th>Great</th><th>Can Make</th><th>Can't</th><th>Score</th></tr></thead><tbody>{rankings.map((r, i) => <tr key={r.id} className={i === 0 ? 'winner' : ''}><td>{i + 1}</td><td>{r.label}</td><td>{r.available}/{responses.length}</td><td>{r.great}</td><td>{r.workable}</td><td>{r.no}</td><td>{r.score}</td></tr>)}</tbody></table></div>
        </section>
        <section className="results-card"><h2>Owner Responses</h2><div className="owner-grid">{responses.map((r) => <article key={r.id}><h3>{r.name}</h3><p className="method">{r.attendance === 'in_person' ? "🏠 In person at Ryan's" : '💻 Drafting remotely'}</p>{r.comments && <p>“{r.comments}”</p>}<details><summary>See availability</summary>{draftOptions.map((o) => <div className="owner-answer" key={o.id}><span>{o.label}</span><b>{r.answers?.[o.id] === 'great' ? '🟢 Great' : r.answers?.[o.id] === 'workable' ? '🟡 Can Make' : "🔴 Can't"}</b></div>)}</details></article>)}</div></section>
      </>}
    </main>
  );
}
