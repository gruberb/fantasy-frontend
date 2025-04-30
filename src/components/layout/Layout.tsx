import { ReactNode } from "react";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />

      <main className="flex-grow container mx-auto max-w-7xl px-4 py-6 lg:py-8">
        {/* Subtle animation for the main content */}
        <div className="animate-fadeIn">{children}</div>
      </main>
      <footer className="bg-gradient-to-r from-[#041E42] to-[#6D4C9F] text-white p-6 text-center">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p className="font-medium">
                Fantasy NHL Dashboard © {currentYear}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/fantasy-teams"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Teams
                  </Link>
                </li>
                <li>
                  <Link
                    to="/skaters"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Players
                  </Link>
                </li>
                <li>
                  <Link
                    to="/games"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Games
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rankings"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Rankings
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Add styles for animations */}
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Layout;
