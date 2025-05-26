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
        <div className="items-center">
          <p className="text-game-light/60 text-sm">
            Made with{' '}
            <span className="text-red-400 animate-pulse inline-block hover:scale-110 transition-transform duration-200">
              ❤️
            </span>{' '}
            by{' '}
            <a
              href="https://bastiangruber.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-game-accent hover:text-game-accent-dark transition-colors duration-200
                             font-medium underline decoration-game-accent/30 hover:decoration-game-accent-dark
                             hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
            >
              Bastian
            </a>
          </p>
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
