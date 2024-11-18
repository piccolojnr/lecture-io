import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-white shadow-md relative">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Study Assistant
            </Link>
          </div>

          <div
            className="hidden md:flex items-center space-x-4"
            id="desktop-menu"
          >
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/flashcards"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
            >
              Flashcards
            </Link>
            <Link
              href="/quiz"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
            >
              Quizzes
            </Link>
            <Link
              href="/progress"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary"
            >
              Progress
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div
            className={`${
              isOpen ? "max-h-screen" : "max-h-0 opacity-0"
            } md:hidden absolute z-50 right-0 top-14 border-b border-gray-200 w-48 rounded-md shadow-lg overflow-hidden transition-all duration-300 ease-in-out`}
            id="mobile-menu"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/flashcards"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
              >
                Flashcards
              </Link>
              <Link
                href="/quiz"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
              >
                Quizzes
              </Link>
              <Link
                href="/progress"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary"
              >
                Progress
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
