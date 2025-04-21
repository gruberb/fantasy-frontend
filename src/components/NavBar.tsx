import { useState } from "react";
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  // Shared Tailwind classes for active vs. inactive links
  const activeLinkClass = "block px-3 py-2 rounded text-white bg-blue-700";
  const inactiveLinkClass =
    "block px-3 py-2 rounded text-gray-300 hover:text-white hover:bg-blue-600";

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Brand */}
          <div className="flex-shrink-0">
            <span className="text-xl font-bold">Fantasy NHL</span>
          </div>

          {/* Mobile menu button (hamburger) – hidden on medium and up */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <svg
                className="block h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  // X icon when mobile menu is open
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  // Hamburger icon when mobile menu is closed
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Nav Links – hidden on small screens */}
          <div className="hidden md:flex space-x-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/teams"
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              Teams
            </NavLink>
            <NavLink
              to="/players"
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              Players
            </NavLink>
            <NavLink
              to="/games"
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              Today's Games
            </NavLink>
            <NavLink
              to="/rankings"
              className={({ isActive }) =>
                isActive ? activeLinkClass : inactiveLinkClass
              }
            >
              Rankings
            </NavLink>
          </div>
        </div>
      </div>

      {/* Mobile Nav Links – only shown on small screens, toggled by `mobileOpen` */}
      {mobileOpen && (
        <div className="md:hidden px-2 pb-3 space-y-1 bg-gray-800">
          <NavLink
            to="/"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? activeLinkClass : inactiveLinkClass
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/teams"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? activeLinkClass : inactiveLinkClass
            }
          >
            Teams
          </NavLink>
          <NavLink
            to="/players"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? activeLinkClass : inactiveLinkClass
            }
          >
            Players
          </NavLink>
          <NavLink
            to="/games"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? activeLinkClass : inactiveLinkClass
            }
          >
            Today's Games
          </NavLink>
          <NavLink
            to="/rankings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              isActive ? activeLinkClass : inactiveLinkClass
            }
          >
            Rankings
          </NavLink>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
