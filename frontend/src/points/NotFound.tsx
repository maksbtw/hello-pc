import { Link } from 'react-router-dom';

/** Shown on top of the table for a URL that isn't a point. The camera stays where it was. */
export default function NotFound() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg/70">
      <section className="glass flex w-[420px] flex-col items-center gap-3 rounded-xl p-10 text-center">
        <p className="font-mono text-sm text-accent-ink">404</p>
        <h1 className="font-heading text-2xl text-text-bright">Nie ma takiego miejsca</h1>
        <p className="font-ui text-base text-text-muted">Ten adres nie prowadzi do żadnej części stołu.</p>
        <Link
          to="/"
          className="mt-4 rounded-pill bg-accent px-5 py-2.5 font-ui text-sm font-medium text-accent-on shadow-edge transition-colors hover:bg-accent-bright"
        >
          Na start
        </Link>
      </section>
    </div>
  );
}
