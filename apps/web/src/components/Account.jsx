// Shared pieces of the signed-in customer pages.
import { useRef } from 'react';
import { Navigate, NavLink, useLocation } from 'react-router-dom';
import { CalendarCheck, LogOut, UserRound } from 'lucide-react';
import { userAuth, useUser } from '../lib/store';
import { formatPhone } from '../lib/phone';

export const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

export const Avatar = ({ name, size = 38 }) => (
  <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.37 }} aria-hidden="true">{initials(name)}</span>
);

export function RequireUser({ children }) {
  const user = useUser();
  const { pathname } = useLocation();
  // Signing out from here goes home; arriving signed out goes to the login page and back.
  const wasSignedIn = useRef(!!user);
  if (!user) return <Navigate to={wasSignedIn.current ? '/' : `/login?next=${encodeURIComponent(pathname)}`} replace />;
  return children;
}

export function AccountLayout({ children }) {
  const user = useUser();
  return (
    <div className="ac-page">
      <div className="container ac-grid">
        <aside className="ac-side">
          <div className="ac-who">
            <Avatar name={user.name} size={52} />
            <div>
              <b>{user.name}</b>
              <small>{formatPhone(user.phone)}</small>
            </div>
          </div>
          <nav aria-label="Your account">
            <NavLink to="/profile"><UserRound size={17} /> Profile</NavLink>
            <NavLink to="/my-bookings"><CalendarCheck size={17} /> My Demo Bookings</NavLink>
          </nav>
          <button type="button" className="ac-out" onClick={userAuth.logout}><LogOut size={17} /> Sign out</button>
        </aside>
        <div className="ac-main">{children}</div>
      </div>
    </div>
  );
}
