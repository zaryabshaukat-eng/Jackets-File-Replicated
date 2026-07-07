/**
 * Minimal hash-based router — no external dependencies.
 * Routes look like /#/collections/all, /#/pages/about, etc.
 */
import React, {
  createContext, useContext, useState, useEffect, useCallback,
  type ReactNode, type ComponentType, type AnchorHTMLAttributes,
} from 'react';

/* ── Internals ─────────────────────────────────────── */
function getHash(): string {
  const h = window.location.hash;
  return h.startsWith('#') ? (h.slice(1) || '/') : '/';
}

/** Split a hash location into its path and search-param parts */
function splitLocation(loc: string): { path: string; search: string } {
  const idx = loc.indexOf('?');
  if (idx === -1) return { path: loc, search: '' };
  return { path: loc.slice(0, idx), search: loc.slice(idx) };
}

const LocCtx    = createContext<string>('/');
const NavCtx    = createContext<(to: string) => void>(() => {});
const ParamsCtx = createContext<Record<string, string>>({});

/* ── HashRouter ───────────────────────────────────── */
export function HashRouter({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<string>(getHash);

  useEffect(() => {
    const h = () => setLoc(getHash());
    window.addEventListener('hashchange', h);
    return () => window.removeEventListener('hashchange', h);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return (
    <NavCtx.Provider value={navigate}>
      <LocCtx.Provider value={loc}>{children}</LocCtx.Provider>
    </NavCtx.Provider>
  );
}

/* ── Hooks ────────────────────────────────────────── */
export function useLocation(): [string, (to: string) => void] {
  return [useContext(LocCtx), useContext(NavCtx)];
}

export function useParams<T extends Record<string, string | undefined>>(): T {
  return useContext(ParamsCtx) as unknown as T;
}

/** Read query params from the current hash location */
export function useSearchParams(): URLSearchParams {
  const [loc] = useLocation();
  const { search } = splitLocation(loc);
  return new URLSearchParams(search);
}

/* ── Link ─────────────────────────────────────────── */
interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}
export function Link({ href, children, onClick, className, style, ...rest }: LinkProps) {
  const [, nav] = useLocation();
  const handle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick?.(e as never);
    nav(href);
  };
  return (
    <a href={`#${href}`} onClick={handle} className={className} style={style} {...rest}>
      {children}
    </a>
  );
}

/* ── Pattern matching ─────────────────────────────── */
type MatchResult = { ok: boolean; params: Record<string, string> };

function matchPath(pattern: string, path: string): MatchResult {
  const keys: string[] = [];
  // :param? → optional segment; :param → required segment
  const re = new RegExp(
    '^' +
    pattern
      .replace(/\/:[a-zA-Z_]+\?/g, (m) => { keys.push(m.slice(2, -1)); return '(?:/([^/]*))?'; })
      .replace(/\/:[a-zA-Z_]+/g,   (m) => { keys.push(m.slice(2));     return '/([^/]+)'; })
      .replace(/\*/g, '.*') +
    '/?$',
    'i',
  );
  const m = path.match(re);
  if (!m) return { ok: false, params: {} };
  const params: Record<string, string> = {};
  keys.forEach((k, i) => { if (m[i + 1] != null) params[k] = decodeURIComponent(m[i + 1]); });
  return { ok: true, params };
}

/* ── Route (used inside Switch) ───────────────────── */
export interface RouteProps {
  path?: string;
  component?: ComponentType;
  children?: ReactNode;
}
// Route itself just renders — Switch controls which Route is shown.
export function Route({ component: Comp, children }: RouteProps) {
  return Comp ? <Comp /> : <>{children}</>;
}

/* ── Switch ───────────────────────────────────────── */
export function Switch({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const { path: locPath } = splitLocation(loc);
  const nodes = React.Children.toArray(children) as React.ReactElement<RouteProps>[];

  for (const child of nodes) {
    const { path } = child.props;
    if (!path) {
      // Catch-all / default route
      return <ParamsCtx.Provider value={{}}>{child}</ParamsCtx.Provider>;
    }
    const { ok, params } = matchPath(path, locPath);
    if (ok) {
      return <ParamsCtx.Provider value={params}>{child}</ParamsCtx.Provider>;
    }
  }
  return null;
}
