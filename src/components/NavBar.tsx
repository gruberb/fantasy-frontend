import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { toLocalDateString } from "../utils/timezone";

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  const isGamesRouteActive = () => {
    return (
      location.pathname === "/games" || location.pathname.startsWith("/games/")
    );
  };

  // Handle navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tailwind classes for active vs. inactive nav links
  const activeLinkClass =
    "block px-4 py-2 rounded-md text-white bg-[#5A3A87] shadow-sm transition-all duration-200";
  const inactiveLinkClass =
    "block px-4 py-2 rounded-md text-gray-200 hover:text-white hover:bg-[#5A3A87] transition-all duration-200";

  return (
    <nav
      className={`sticky top-0 z-50 bg-gradient-to-r from-[#6D4C9F] to-[#8A6CB5] ${scrolled ? "shadow-lg" : "shadow-md"} transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="hidden md:flex items-center space-x-1">
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
              to={`/games/${toLocalDateString(new Date())}`}
              className={({ isActive }) =>
                isActive || isGamesRouteActive()
                  ? activeLinkClass
                  : inactiveLinkClass
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
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-[#5A3A87] focus:outline-none transition-all duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
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
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gradient-to-r from-[#6D4C9F] to-[#8A6CB5]">
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
              to={`/games/${toLocalDateString(new Date())}`}
              className={({ isActive }) =>
                isActive || isGamesRouteActive()
                  ? activeLinkClass
                  : inactiveLinkClass
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
        </div>
      )}
    </nav>
  );
};

export default NavBar;
