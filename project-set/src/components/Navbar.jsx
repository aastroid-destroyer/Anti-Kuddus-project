import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import useAuth from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import pic from '../assets/pic-PhotoRoom.png'

// Mirrors --ease-out from index.css so the JS-driven float shares the same
// rhythm as every CSS transition in the bar.
const EASE_OUT = [0.23, 1, 0.32, 1];

// Public links render for everyone. "Make a complaint" is behind PrivateRoute,
// so an unauthenticated tap lands on /login and returns here after sign in.
const publicLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/make-complaint', label: 'Make a complaint', end: false },
    { to: '/seat-planner', label: 'Seat planner', end: false },
    { to: '/tiffin-ledger', label: 'Tiffin ledger', end: false },
    { to: '/sos', label: 'SOS', end: false },
];

// Only meaningful once signed in, so it stays out of the bar until then.
// The captain dashboard is shown to everyone signed in for convenience; the
// backend is what actually gates the data (non-captains get 403, no alerts).
const authedLinks = [
    { to: '/all-complaints', label: 'All complaints', end: false },
    { to: '/captain', label: 'Captain', end: false },
    { to: '/syllabus-negotiator', label: 'Syllabus', end: false },
    { to: '/kuddus-fact-checker', label: 'Fact-Checker', end: false },
];

// The sliding pill is the active indicator, so links themselves only carry the
// text-color shift plus a faint hover fill. `relative z-10` keeps the label
// above the pill that slides behind it.
const linkClass = ({ isActive }) =>
    [
        'relative z-10 rounded-control px-3 py-2 text-sm font-medium outline-none',
        'transition-colors duration-150 ease-[var(--ease-out)]',
        'hover:bg-ink/5',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        isActive ? 'text-ink' : 'text-muted hover:text-ink',
    ].join(' ');

const Navbar = () => {
    const { user, loading, logOut } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const reduceMotion = useReducedMotion();
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [solidSurface, setSolidSurface] = useState(false);

    const navRef = useRef(null);
    const pillRef = useRef(null);
    const toggleRef = useRef(null);
    const pillReady = useRef(false);

    // Authed links only appear once a user is present; loading shows none yet.
    const navLinks = user ? [...publicLinks, ...authedLinks] : publicLinks;
    const linkCount = navLinks.length;

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    // Position the indicator under the link react-router marked active
    // (aria-current="page"), so the active logic stays entirely with NavLink.
    // The transform is written straight to the node, never through state, so a
    // reposition costs no re-render. When no nav link is active (e.g. /login)
    // the pill fades out.
    const positionPill = useCallback(() => {
        const pill = pillRef.current;
        const container = navRef.current;
        if (!pill || !container) return;

        const active = container.querySelector('a[aria-current="page"]');
        if (!active) {
            pill.style.opacity = '0';
            return;
        }

        // Skip the slide the very first time so the pill appears in place.
        if (!pillReady.current) {
            pill.style.transition = 'none';
        }

        pill.style.width = `${active.offsetWidth}px`;
        pill.style.transform = `translate(${active.offsetLeft}px, -50%)`;
        pill.style.opacity = '1';

        if (!pillReady.current) {
            // Force a reflow, then hand the transition back to the .nav-pill class.
            void pill.offsetWidth;
            pill.style.transition = '';
            pillReady.current = true;
        }
    }, []);

    // Reposition on route change and whenever the link set changes (sign in/out).
    useLayoutEffect(() => {
        positionPill();
    }, [pathname, linkCount, positionPill]);

    // Keep the pill aligned when the row reflows: viewport resize, font load, or
    // any width change of the links container.
    useEffect(() => {
        const container = navRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => positionPill());
        observer.observe(container);
        window.addEventListener('resize', positionPill);
        document.fonts?.ready.then(positionPill).catch(() => {});

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', positionPill);
        };
    }, [positionPill]);

    // Scroll-aware surface. Only flips the boolean when the threshold is crossed,
    // so the tree does not re-render every frame (frontend-rules §7). The
    // threshold sits above the iOS rubber-band overscroll range so the float
    // doesn't flicker when the page bounces at the very top.
    useEffect(() => {
        const onScroll = () => {
            const next = window.scrollY > 24;
            setScrolled((prev) => (prev === next ? prev : next));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Honor prefers-reduced-transparency with a solid surface fallback
    // (design.md §9.A). Read at runtime via matchMedia rather than a CSS media
    // query, because the build's CSS toolchain strips that newer media feature.
    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-transparency: reduce)');
        const sync = () => setSolidSurface(query.matches);
        sync();
        query.addEventListener('change', sync);
        return () => query.removeEventListener('change', sync);
    }, []);

    // Close the mobile menu on navigation.
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Escape closes the menu and returns focus to the trigger (disclosure a11y).
    // A resize up to the desktop layout also closes it so state can't get stuck.
    useEffect(() => {
        if (!menuOpen) return;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
                toggleRef.current?.focus();
            }
        };
        const desktop = window.matchMedia('(min-width: 768px)');
        const onDesktop = (event) => event.matches && setMenuOpen(false);

        window.addEventListener('keydown', onKeyDown);
        desktop.addEventListener('change', onDesktop);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            desktop.removeEventListener('change', onDesktop);
        };
    }, [menuOpen]);

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await logOut();
            navigate('/');
        } catch {
            // Sign out rarely fails; if it does, keep the user where they are
            // rather than pretending they were logged out.
        } finally {
            // Navbar stays mounted across the route change (SPA), so this must
            // reset on success too - otherwise the next login re-renders the
            // button still stuck on "Logging out...".
            setSigningOut(false);
        }
    };

    // Shared button shapes so desktop and mobile stay identical.
    const signOutButton = (
        <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="h-9 rounded-control border border-border px-3 text-sm font-medium text-ink outline-none transition-[transform,background-color] duration-150 ease-[var(--ease-out)] active:scale-[0.98] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
            {signingOut ? 'Logging out...' : 'Log out'}
        </button>
    );

    const signedOutButtons = (
        <>
            <Link
                to="/login"
                onClick={closeMenu}
                className="flex h-9 items-center rounded-control px-3 text-sm font-medium text-ink outline-none transition-colors duration-150 ease-[var(--ease-out)] hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
                Log in
            </Link>
        </>
    );

    // While auth resolves, reserve the space so the bar does not jump (CLS).
    const authActions = loading ? (
        <span aria-hidden="true" className="h-9 w-24 rounded-control bg-surface" />
    ) : user ? (
        signOutButton
    ) : (
        signedOutButtons
    );

    return (
        <motion.header
            // Raw `transform` string, not the `y` shorthand: motion's x/y/scale
            // shorthands interpolate via rAF on the main thread, while a plain
            // transform value stays a compositor-only, hardware-accelerated animation.
            animate={{ transform: `translateY(${scrolled && !reduceMotion ? 8 : 0}px)` }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className="nav-enter sticky top-2 z-30 sm:top-3"
        >
            {/* Docked chrome: the flush, edge-to-edge bar at rest. Fades out as
                the bar lifts into its floating state below. */}
            <div
                aria-hidden="true"
                className={[
                    'pointer-events-none absolute inset-0 border-b transition-[opacity,background-color,border-color] duration-300 ease-[var(--ease-out)]',
                    'motion-reduce:transition-none',
                    solidSurface ? 'bg-bg' : 'backdrop-blur-2xl',
                    scrolled
                        ? 'border-transparent opacity-0'
                        : `border-transparent opacity-100 ${solidSurface ? '' : 'bg-bg/30'}`,
                ].join(' ')}
            />
            {/* Floating chrome: the inset, rounded island the bar settles into
                once the page scrolls. Sits inactive (opacity-0) at rest so the
                two chrome layers crossfade instead of stacking. */}
            <div
                aria-hidden="true"
                className={[
                    'pointer-events-none absolute inset-x-3 inset-y-0 rounded-2xl border transition-[opacity,background-color,border-color,box-shadow] duration-300 ease-[var(--ease-out)] sm:inset-x-4',
                    'motion-reduce:transition-none',
                    solidSurface ? 'bg-bg' : 'bg-bg/45 backdrop-blur-2xl',
                    scrolled
                        ? 'border-border opacity-100 shadow-bar'
                        : 'border-transparent opacity-0 shadow-none',
                ].join(' ')}
            />

            <nav
                aria-label="Primary"
                className="relative z-10 mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
            >
                <Link
                    to="/"
                    onClick={closeMenu}
                    className="group flex items-center gap-2.5 rounded-control outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                >
                    <img src={pic} alt="" className='h-9 w-9 hover:-translate-y-1 transition-transform duration-200 ease-out rounded-full'/>
                    <span className="text-base font-semibold tracking-tight text-ink">
                        Anti Bully Protocol
                    </span>
                </Link>

                {/* Desktop: links + theme toggle + auth on one line. */}
                <div className="hidden items-center gap-3 md:flex">
                    {/* Links row is the pill's positioning context. */}
                    <div ref={navRef} className="relative flex items-center gap-1">
                        <span
                            ref={pillRef}
                            aria-hidden="true"
                            className="nav-pill pointer-events-none absolute left-0 top-1/2 h-9 w-0 rounded-control border border-border bg-surface opacity-0 shadow-raised will-change-transform"
                        />
                        {navLinks.map((link) => (
                            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                    <span className="mx-1 h-6 w-px bg-border" aria-hidden="true" />
                    <ThemeToggle />
                    {authActions}
                </div>

                {/* Mobile: theme toggle stays reachable without opening the menu. */}
                <div className="flex items-center gap-1 md:hidden">
                    <ThemeToggle />
                    <button
                        ref={toggleRef}
                        type="button"
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-menu"
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        className="grid h-11 w-11 place-items-center rounded-control text-ink outline-none transition-colors duration-150 hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                    >
                        <span aria-hidden="true" className="relative block h-4 w-5">
                            <span
                                className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${menuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0'
                                    }`}
                            />
                            <span
                                className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 motion-reduce:transition-none ${menuOpen ? 'opacity-0' : 'opacity-100'
                                    }`}
                            />
                            <span
                                className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${menuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0'
                                    }`}
                            />
                        </span>
                    </button>
                </div>
            </nav>

            {/* Mobile panel. Stays mounted so it animates on exit too; it overlays
                the page (absolute) instead of reflowing content below it. When
                closed it is invisible + inert, so it leaves the tab order. */}
            <div
                id="mobile-menu"
                className={[
                    'absolute top-full border-border shadow-menu origin-top md:hidden',
                    'transition-[opacity,transform,visibility] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none',
                    solidSurface ? 'bg-bg' : 'bg-bg/95 backdrop-blur-xl',
                    // Matches the floating pill's shape once scrolled, so the
                    // dropdown reads as part of the same island; snaps (not
                    // animated) since the two states rarely change at once.
                    scrolled ? 'inset-x-3 rounded-b-2xl border-x border-b sm:inset-x-4' : 'inset-x-0 border-b',
                    menuOpen
                        ? 'visible translate-y-0 opacity-100'
                        : 'pointer-events-none invisible -translate-y-2 opacity-0',
                ].join(' ')}
            >
                <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
                    {navLinks.map((link, index) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            onClick={closeMenu}
                            style={{ transitionDelay: menuOpen ? `${index * 40}ms` : '0ms' }}
                            className={({ isActive }) =>
                                [
                                    'rounded-control px-3 py-2.5 text-sm font-medium outline-none',
                                    'transition-[color,background-color,opacity,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none',
                                    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
                                    menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0',
                                    isActive
                                        ? 'bg-surface text-ink shadow-raised'
                                        : 'text-muted hover:bg-ink/5 hover:text-ink',
                                ].join(' ')
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
                        {authActions}
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default Navbar;
