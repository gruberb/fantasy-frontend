import { ReactNode } from "react";
import NavBar from "./NavBar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>Fantasy NHL Dashboard © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
