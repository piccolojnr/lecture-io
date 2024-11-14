import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-1">{children}</main>
      <footer
        className="bg-white text-center text-gray-600 py-4"
        style={{ boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <p>&copy; 2023 My Application</p>
      </footer>
    </div>
  );
};

export default Layout;
