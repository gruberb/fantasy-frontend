import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  // Tailwind classes for active vs. inactive nav links
  const activeLinkClass =
    "block px-3 py-2 rounded text-white bg-blue-900 shadow";
  const inactiveLinkClass =
    "block px-3 py-2 rounded text-gray-200 hover:text-white hover:bg-blue-700 transition-all duration-200";

  return (
    <nav className="bg-gradient-to-r from-blue-800 to-purple-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-white tracking-wide">
                Fantasy
              </span>
              <span className="text-2xl font-extrabold text-yellow-400 tracking-wider">
                NHL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
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
              Game Center
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none transition-all duration-200"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
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
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden px-2 pb-3 space-y-1 bg-gradient-to-r from-blue-800 to-purple-800">
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
            Game Center
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
