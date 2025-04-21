import { NavLink } from "react-router-dom";

const NavBar = () => {
  // Active link styling
  const activeLinkClass = "text-white bg-blue-700 px-3 py-2 rounded";
  const inactiveLinkClass =
    "text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded";

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-xl font-bold mb-4 md:mb-0">Fantasy NHL</div>

        <div className="flex space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? activeLinkClass : inactiveLinkClass
            }
            end
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
    </nav>
  );
};

export default NavBar;
