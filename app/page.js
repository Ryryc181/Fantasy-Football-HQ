'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { availabilityChoices, draftOptions } from '../lib/draftOptions';

const emptyAvailability = Object.fromEntries(draftOptions.map((option) => [option.id, '']));

export default function HomePage() {
  const [name, setName] = useState('');
  const [availability, setAvailability] = useState(emptyAvailability);
  const [mode, setMode] = useState('');
  const [comments, setComments] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const workableCount = useMemo(
    () => Object.values(availability).filter((value) => value === 'great' || value === 'work').length,
    [availability]
  );

  function setChoice(optionId, value) {
    setAvailability((current) => ({ ...current, [optionId]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Please enter your name.' });
      return;
    }

    const unanswered = draftOptions.filter((option) => !availability[option.id]);
    if (unanswered.length) {
      setStatus({ type: 'error', message: 'Please answer every draft-time option.' });
      return;
    }

    if (workableCount < 2) {
      setStatus({ type: 'error', message: 'Please mark at least two times as Works Great or I Can Make It Work.' });
      return;
    }

    if (!mode) {
      setStatus({ type: 'error', message: 'Please answer how you plan to participate.' });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), availability, mode, comments: comments.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');
      setSubmitted(true);
      setStatus({ type: 'success', message: 'Your vote has been recorded.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="site-shell confirmation-shell">
        <section className="confirmation-card">
          <Image src="/images/smack-talk.jpg" alt="Fantasy Fools league members joking around" width={1152} height={2048} className="confirmation-image" priority />
          <div className="confirmation-copy">
            <span className="eyebrow">Vote submitted</span>
            <h1>Talking smack is mandatory. Winning is optional.</h1>
            <p>Thanks, {name}. Your draft availability is officially in the commissioner&apos;s hands.</p>
            <button className="secondary-button" onClick={() => window.location.reload()}>Submit another response</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <header className="hero">
        <div className="hero-overlay" />
        <div className="hero-inner site-shell">
          <div className="hero-copy">
            <span className="eyebrow">Yahoo League • 2026 Draft</span>
            <h1>Fantasy Fools Draft Headquarters</h1>
            <p>Commissioner Ryan has spoken. Pick the times you can make so we can lock in draft night before somebody starts making excuses.</p>
            <div className="hero-badges"><span>🏈 All answers required</span><span>📱 Takes about 2 minutes</span></div>
          </div>
          <figure className="hero-photo-card">
            <Image src="/images/commissioner-snoop.jpg" alt="Fantasy Fools commissioner posing at an event" width={1123} height={1401} priority />
            <figcaption><strong>Commissioner&apos;s orders:</strong> Complete the survey or prepare to be publicly shamed.</figcaption>
          </figure>
        </div>
      </header>

      <div className="site-shell content-grid">
        <form className="survey-card" onSubmit={handleSubmit} noValidate>
          <section className="question-section">
            <div className="question-number">1</div>
            <div className="question-content">
              <label className="question-title" htmlFor="name">Name <span>*</span></label>
              <input id="name" className="text-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" required />
            </div>
          </section>

          <section className="question-section availability-section">
            <div className="question-number">2</div>
            <div className="question-content">
              <h2 className="question-title">Pick your availability for every draft time <span>*</span></h2>
              <p className="question-help">Choose one answer for every option. You must mark at least two times as <strong>Works Great</strong> or <strong>I Can Make It Work</strong>.</p>
              <div className="availability-progress"><span>{workableCount} workable option{workableCount === 1 ? '' : 's'} selected</span><span>Minimum: 2</span></div>
              <div className="date-list">
                {draftOptions.map((option) => (
                  <fieldset className="date-card" key={option.id}>
                    <legend>{option.label}</legend>
                    <div className="choice-grid">
                      {availabilityChoices.map((choice) => (
                        <label className={`choice-card ${availability[option.id] === choice.value ? 'selected' : ''}`} key={choice.value}>
                          <input type="radio" name={option.id} value={choice.value} checked={availability[option.id] === choice.value} onChange={() => setChoice(option.id, choice.value)} required />
                          <span className="choice-icon">{choice.icon}</span>
                          <span><strong>{choice.label}</strong><small>{choice.helper}</small></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>
          </section>

          <aside className="safety-card">
            <Image src="/images/wrist-ir.jpg" alt="Fantasy Fools member posing after a wrist injury" width={1500} height={2000} />
            <div><span className="eyebrow">Official league safety notice</span><h2>Punching bags remain undefeated.</h2><p>Please draft responsibly. Wrist injuries caused by unnecessary draft-night confidence may be mocked for multiple seasons.</p></div>
          </aside>

          <section className="question-section">
            <div className="question-number">3</div>
            <div className="question-content">
              <h2 className="question-title">I would love to have everyone in person for the draft, but I understand that it&apos;s not always possible. I tried to give plenty of options so we can make that happen. If you can&apos;t, or just don&apos;t want to, there is an option for that. <span>*</span></h2>
              <div className="stacked-options">
                <label className={`long-choice ${mode === 'in-person' ? 'selected' : ''}`}>
                  <input type="radio" name="mode" value="in-person" checked={mode === 'in-person'} onChange={(e) => setMode(e.target.value)} required />
                  <span>Heck yea I will be drafting and talking smack at Ryan&apos;s house</span>
                </label>
                <label className={`long-choice ${mode === 'remote' ? 'selected' : ''}`}>
                  <input type="radio" name="mode" value="remote" checked={mode === 'remote'} onChange={(e) => setMode(e.target.value)} required />
                  <span>I will still be talking smack but will have to do it remotely - sorry I am lame</span>
                </label>
              </div>
            </div>
          </section>

          <section className="question-section">
            <div className="question-number">4</div>
            <div className="question-content">
              <label className="question-title" htmlFor="comments">Anything else I should know? <em>Optional</em></label>
              <textarea id="comments" className="text-input textarea" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Schedule notes, food requests, excuses, or early-season smack talk..." />
            </div>
          </section>

          {status.message && <div className={`status-message ${status.type}`}>{status.message}</div>}
          <button className="submit-button" type="submit" disabled={submitting}>{submitting ? 'LOCKING IT IN...' : 'LOCK IN MY AVAILABILITY'}</button>
          <p className="privacy-note">Submitting again with the same name updates that person&apos;s previous response.</p>
        </form>

        <aside className="sidebar">
          <div className="sidebar-card"><h3>How the winner is picked</h3><p>The commissioner dashboard prioritizes the times that include the most owners, then uses preference points to separate ties.</p><ul><li>Works Great = 2 points</li><li>Can Make It Work = 1 point</li><li>Can&apos;t Make It = 0 points</li></ul></div>
          <figure className="smack-photo"><Image src="/images/smack-talk.jpg" alt="Two Fantasy Fools league members joking around" width={1152} height={2048} /><figcaption>Two analysts conducting serious preseason research.</figcaption></figure>
          <a className="commissioner-link" href="/commissioner">Commissioner dashboard →</a>
        </aside>
      </div>
      <footer><strong>Fantasy Fools</strong><span>Where friendships are ruined one draft pick at a time.</span></footer>
    </main>
  );
}
