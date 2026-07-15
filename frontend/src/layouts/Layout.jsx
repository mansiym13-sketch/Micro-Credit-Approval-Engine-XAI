import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { path: '/',           icon: 'assignment_turned_in', label: 'Evaluate'  },
  { path: '/history',    icon: 'history',              label: 'History'   },
  { path: '/portfolio',  icon: 'insert_chart',         label: 'Portfolio' },
];

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b1326' }}>
      {/* Top navbar */}
      <header
        className="fixed top-0 w-full z-50 flex items-center justify-between px-8 h-16"
        style={{ background: 'rgba(11,19,38,0.85)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined" style={{ color: '#c0c1ff', fontSize: '22px' }}>account_balance</span>
          <span className="font-extrabold text-lg tracking-tighter" style={{ color: '#c0c1ff' }}>LOAN ENGINE</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map(({ path, icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive ? 'text-[#c0c1ff]' : 'text-[#908fa0] hover:text-[#c7c4d7]'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(128,131,255,0.15)' : 'transparent',
                border: isActive ? '1px solid rgba(128,131,255,0.25)' : '1px solid transparent',
              })}
            >
              <span className="material-symbols-outlined text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
          <span className="text-[11px] font-medium hidden md:block" style={{ color: '#908fa0' }}>API Online</span>
        </div>
      </header>

      {/* Page content */}
      <main className="pt-24 pb-16 px-4 md:px-8">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center py-2 z-50"
        style={{ background: 'rgba(23,31,51,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
      >
        {navItems.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className="flex flex-col items-center px-4 py-1"
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined text-xl" style={{ color: isActive ? '#c0c1ff' : '#908fa0', fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="text-[10px] font-semibold mt-0.5" style={{ color: isActive ? '#c0c1ff' : '#908fa0' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
