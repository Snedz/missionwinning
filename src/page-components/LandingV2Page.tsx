'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { LANDING_PREVIEW_EN as copy } from '@/i18n/landingPreviewLocales';
import { forgeFontClass } from './landingForgeFonts';
import LandingV2DemoLoader from './LandingV2DemoLoader';
import forge from './landingForge.module.css';
import s from './landingV2.module.css';

const photos = [
  { src: '/photo/phone-bench.webp', position: 'center 45%' },
  { src: '/photo/home-rack.webp', position: 'center 40%' },
  { src: '/photo/bare-wrist.webp', position: 'center 45%' },
];

function LogLink() {
  return <a href="/active" className={s.cta}>{copy.log} <span aria-hidden="true">↗</span></a>;
}

export default function LandingV2Page() {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [dock, setDock] = useState(false);
  const [openCard, setOpenCard] = useState<string>();
  const rulesId = useId();
  const hero = useRef<HTMLElement>(null);
  const start = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setFrame(previous => (previous + 1) % photos.length), 6000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    const heroElement = hero.current;
    const startElement = start.current;
    if (!heroElement || !startElement) return;
    const observer = new IntersectionObserver(() => {
      const bounds = startElement.getBoundingClientRect();
      setDock(heroElement.getBoundingClientRect().bottom <= 0 && bounds.top >= window.innerHeight);
    });
    observer.observe(heroElement);
    observer.observe(startElement);
    return () => observer.disconnect();
  }, []);

  return <div className={`${s.root} ${forge.previewTheme} ${forgeFontClass}`} lang="en">
    <a className="sr-only focus:not-sr-only" href="#preview-main">{copy.skip}</a>
    <header className={s.masthead}>
      <div className={s.frame}>
        <a href="/" className={s.brand}>
          <span className={s.bolt} aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M13 2 4 14h7l-1 8 9-12h-7z" /></svg></span>
          <span><strong>{copy.brand}</strong><small>{copy.rail}</small></span>
        </a>
        <a href="#week-example" className={s.mastLink}>{copy.seeExample} <span aria-hidden="true">↓</span></a>
      </div>
    </header>
    <main id="preview-main" tabIndex={-1}>
      <section ref={hero} className={s.hero} aria-labelledby="preview-title">
        <div className={s.reel} aria-hidden="true" data-playing={playing}>
          {photos.map(({ src, position }, index) => (
            <div key={src} className={index === frame ? s.current : undefined}>
              <Image src={src} alt="" fill sizes="100vw" loading={index === 0 ? 'eager' : 'lazy'} style={{ objectPosition: position }} />
            </div>
          ))}
        </div>
        <div className={s.shade} />
        <div className={`${s.frame} ${s.heroInner}`}>
          <div className={s.heroCopy}>
            <p className={s.marker}>{copy.heroLabel}</p>
            <h1 id="preview-title">{copy.headline.map(line => <span key={line}>{line}</span>)}</h1>
            <p className={s.description}>{copy.description}</p>
            <div className={s.actions}><LogLink /><a href="#week-example" className={s.secondary}>{copy.seeExample}</a></div>
            <p className={s.proof}>{copy.guest}</p>
          </div>
          <div className={s.controls}>
            <span>{copy.reel} / 0{frame + 1}</span>
            <button type="button" aria-label={playing ? copy.pause : copy.play} onClick={() => setPlaying(value => !value)}>{playing ? 'Ⅱ' : '▶'}</button>
          </div>
        </div>
        <div key={frame} className={s.reelMeter} data-playing={playing} aria-hidden="true" />
      </section>
      <div className={s.ticker} aria-hidden="true">{copy.ticker.map(word => <span key={word}>{word}</span>)}</div>

      <section className={s.section} aria-labelledby="preview-anywhere">
        <div className={s.frame}>
          <p className={s.marker}>{copy.anywhereLabel}</p>
          <h2 id="preview-anywhere">{copy.anywhereTitle}</h2>
          <div className={s.cards}>{copy.anywhere.map(({ heading, body, photo }) => (
            <article key={heading}>
              <div className={s.cardPhoto}><Image src={photo} alt="" fill sizes="(max-width: 680px) 92vw, 31vw" /></div>
              <div className={s.cardText}><h3>{heading}</h3><p>{body}</p></div>
            </article>
          ))}</div>
        </div>
      </section>

      <section id="week-example" className={`${s.section} ${s.band}`} aria-labelledby="preview-week">
        <div className={`${s.frame} ${s.coachGrid}`}>
          <div>
            <p className={s.marker}>{copy.exampleLabel}</p>
            <h2 id="preview-week">{copy.exampleTitle}</h2>
            <p className={s.description}>{copy.exampleDescription}</p>
          </div>
          <LandingV2DemoLoader />
        </div>
      </section>

      <section className={s.section} aria-labelledby="preview-goals">
        <div className={s.frame}>
          <p className={s.marker}>{copy.goalsLabel}</p>
          <h2 id="preview-goals">{copy.goalsTitle}</h2>
          <div className={s.goalList}>{copy.goals.map(({ heading, body }) => (
            <article key={heading} className={s.cardText}><h3>{heading}</h3><p>{body}</p></article>
          ))}</div>
          <div className={s.ruleGrid}>{copy.rules.map(({ heading, body }, index) => {
            const answerId = `${rulesId}-answer-${index}`;
            const triggerId = `${rulesId}-trigger-${index}`;
            const expanded = openCard === heading;
            return (
              <div key={heading} className={s.flip}>
                <button
                  id={triggerId}
                  type="button"
                  className={s.flipTitle}
                  aria-controls={answerId}
                  aria-expanded={expanded}
                  onClick={() => setOpenCard(current => current === heading ? undefined : heading)}
                >
                  {heading} <span aria-hidden="true">↻</span>
                </button>
                <div id={answerId} role="region" aria-labelledby={triggerId} className={s.flipBack} hidden={!expanded}>
                  {body}
                </div>
              </div>
            );
          })}</div>
        </div>
      </section>

      <section className={`${s.section} ${s.band}`} aria-labelledby="preview-devices">
        <div className={s.frame}>
          <p className={s.marker}>{copy.deviceLabel}</p>
          <h2 id="preview-devices">{copy.deviceTitle}</h2>
          <div className={s.deviceGrid}>{copy.devices.map(({ heading, body }) => (
            <article key={heading} className={s.cardText}><h3>{heading}</h3><p>{body}</p></article>
          ))}</div>
        </div>
      </section>

      <section ref={start} className={s.section} aria-labelledby="preview-start">
        <div className={`${s.frame} ${s.booking}`}>
          <div><p className={s.marker}>{copy.closeLabel}</p><h2 id="preview-start">{copy.closeTitle}</h2><p className={s.description}>{copy.final}</p></div>
          <LogLink />
        </div>
      </section>
    </main>
    <footer className={s.footer}><span aria-hidden="true">{copy.wordmark}</span><p>{copy.brand}</p></footer>
    {dock && <div className={s.dock}><span>{copy.guest}</span><LogLink /></div>}
  </div>;
}
