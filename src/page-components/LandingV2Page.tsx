import Image from 'next/image';
import Link from 'next/link';
import { LANDING_PREVIEW_EN as copy } from '@/i18n/landingPreviewLocales';
import { landingPreviewWeek, previewSets } from '@/lib/coach/landingPreviewWeek';
import LandingV2DemoLoader from './LandingV2DemoLoader';
import s from './landingV2.module.css';

function LogLink() {
  return <Link href="/active" className={s.primary}>{copy.log} <span aria-hidden="true">↗</span></Link>;
}

function WeekComparison() {
  const rows = [
    { label: copy.prior, sessions: landingPreviewWeek('dumbbells', 3) },
    { label: copy.rebuilt, sessions: landingPreviewWeek('dumbbells', 3, 2) },
  ];
  return (
    <div className={s.record}>
      <header className={s.recordHead}><h3 id="preview-week">{copy.weekTitle}</h3><span>{copy.sample}</span></header>
      <table className={s.calendar} aria-labelledby="preview-week">
        <thead><tr><td />{copy.days.map((day, index) => (
          <th scope="col" key={day}><span aria-hidden="true">{copy.shortDays[index]}</span><span className="sr-only">{day}</span></th>
        ))}</tr></thead>
        <tbody>{rows.map(({ label, sessions }) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            {copy.days.map((day, index) => {
              const planned = sessions.some(({ dayOffset }) => dayOffset === index);
              return <td key={day} className={planned ? s.planned : undefined}>
                <span aria-hidden="true">{planned ? '●' : '–'}</span>
                <span className="sr-only">{planned ? copy.hasSession : copy.noSession}</span>
              </td>;
            })}
          </tr>
        ))}</tbody>
      </table>
      <p className={s.recordNote}>{copy.weekSource}</p>
    </div>
  );
}

export default function LandingV2Page() {
  return (
    <div className={s.page} lang="en">
      <a className="sr-only focus:not-sr-only" href="#notebook-main">{copy.skip}</a>
      <header className={s.masthead}>
        <div className={s.frame}>
          <Link href="/" className={s.brand}>{copy.brand}</Link>
          <Link href="/log" className={s.inline}>{copy.notebook} <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <main id="notebook-main" tabIndex={-1}>
        <section className={`${s.frame} ${s.hero}`} aria-labelledby="notebook-title">
          <div>
            <p className={s.kicker}>{copy.heroLabel}</p>
            <h1 id="notebook-title">{copy.titleStart}<br />{copy.titleEnd}</h1>
            <p className={s.lead}>{copy.description}</p>
            <div className={s.actions}><LogLink /><a className={s.inline} href="#week-example">{copy.seeExample} <span aria-hidden="true">↓</span></a></div>
            <p className={s.note}>{copy.guest}</p>
          </div>
          <figure className={s.record}>
            <figcaption className={s.recordHead}><span>{copy.receipt}</span><span>{copy.sample}</span></figcaption>
            <div className={s.receipt}>
              <h2>{copy.movement}</h2>
              <ol>{previewSets.map(({ reps, weight }, index) => (
                <li key={index}><span>{String(index + 1).padStart(2, '0')}</span><strong>{reps} {copy.reps}</strong><span>{weight} kg</span></li>
              ))}</ol>
            </div>
          </figure>
        </section>
        <section id="week-example" className={s.band} aria-labelledby="week-example-title">
          <div className={`${s.frame} ${s.example}`}>
            <div className={s.sectionCopy}>
              <p className={s.kicker}>{copy.exampleLabel}</p>
              <h2 id="week-example-title">{copy.exampleTitle}</h2>
              <p>{copy.exampleDescription}</p>
            </div>
            <div><WeekComparison /><LandingV2DemoLoader /></div>
          </div>
        </section>
        <section className={`${s.frame} ${s.section}`} aria-labelledby="app-screens">
          <div className={s.sectionCopy}>
            <p className={s.kicker}>{copy.screensLabel}</p>
            <h2 id="app-screens">{copy.screensTitle}</h2>
            <p>{copy.screensIntro}</p>
          </div>
          <div className={s.screens}>{Object.entries(copy.screens).map(([id, screen], index) => (
            <figure key={id}>
              <figcaption className={s.kicker}>0{index + 1} / {screen.name}</figcaption>
              <Image className={s.phone} src={`/brand/preview-${id}-phone.webp`} width={390} height={844} sizes="(max-width: 420px) 82vw, 265px" alt={screen.alt} />
              {id !== 'today' && <Image className={s.laptop} src={`/brand/preview-${id}-laptop.webp`} width={960} height={600} sizes="(min-width: 1024px) 30vw, 1px" alt={screen.alt} />}
            </figure>
          ))}</div>
        </section>
        <section className={s.band} aria-labelledby="notebook-device">
          <div className={`${s.frame} ${s.section}`}>
            <div className={s.sectionCopy}>
              <p className={s.kicker}>{copy.deviceLabel}</p>
              <h2 id="notebook-device">{copy.deviceTitle}</h2>
            </div>
            <div className={s.devices}>{copy.devices.map(({ heading, body }) => <div key={heading}><h3>{heading}</h3><p>{body}</p></div>)}</div>
          </div>
        </section>
        <div className={`${s.frame} ${s.final}`}><p>{copy.final}</p><LogLink /></div>
      </main>
      <footer className={`${s.frame} ${s.footer}`}><span>{copy.brand}</span><Link className={s.inline} href="/log">{copy.notebook}</Link></footer>
    </div>
  );
}
