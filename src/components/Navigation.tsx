"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function Navigation() {
  const { data: session } = useSession();
  const [isStudyToolsOpen, setIsStudyToolsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        ref2.current &&
        !ref2.current.contains(event.target as Node)
      ) {
        setIsStudyToolsOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  const DropdownMenu = ({
    isOpen,
    items,
  }: {
    isOpen: boolean;
    items: { href?: string; label: string; action?: () => Promise<void> }[];
  }) => {
    if (!isOpen) return null;
    return (
      <div
        ref={ref2}
        className="absolute z-10 top-0 right-0  mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
      >
        <div className="py-1" role="menu">
          {items.map((item) =>
            item.action ? (
              <button
                key={item.label}
                onClick={async (e: any) => {
                  e.preventDefault();
                  e.stopPropagation();
                  item.action && (await item.action());
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.href}
                href={item.href!}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      </div>
    );
  };

  const mobileMenuItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/notes", label: "Notes" },
    { href: "/dashboard/mindmaps", label: "Mind Maps" },
    { href: "/dashboard/progress", label: "Progress" },
    { href: "/dashboard/ai-assistant", label: "AI Assistant" },
  ];

  const studyToolsItems = [
    { href: "/dashboard/notes", label: "Notes" },
    { href: "/dashboard/mindmaps", label: "Mind Maps" },
  ];

  return (
    <nav className="bg-white shadow flex">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between w-full">
        <div className="flex justify-between h-16 w-full">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600">
                Lecture IO
              </Link>
            </div>
            {session && (
              <div ref={ref} className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>

                {/* Study Tools Dropdown */}
                <div className="relative flex items-center justify-center">
                  <button
                    onClick={() => setIsStudyToolsOpen(!isStudyToolsOpen)}
                    aria-expanded={isStudyToolsOpen}
                    aria-controls="study-tools-menu"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Study Tools
                    <svg
                      className="ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <DropdownMenu
                    isOpen={isStudyToolsOpen}
                    items={studyToolsItems}
                  />
                </div>

                <Link
                  href="/dashboard/progress"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Progress
                </Link>

                <Link
                  href="/dashboard/ai-assistant"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  AI Assistant
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Menu */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="block h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        {/* User Menu */}
        <div className="sm:ml-6 sm:flex sm:items-center">
          {session ? (
            <div className="relative flex items-start justify-start">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-expanded={isUserMenuOpen}
                aria-controls="user-menu"
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <span
                  className="rounded-full bg-gray-200 p-1 flex items-center justify-center"
                  style={{ width: 32, height: 32 }}
                >
                  {session.user?.name?.[0] ?? "U"}
                </span>
              </button>
              <DropdownMenu
                isOpen={isUserMenuOpen}
                items={[
                  { href: "/dashboard/profile", label: "Profile" },
                  { href: "/dashboard/settings", label: "Settings" },
                  { label: "Sign out", action: handleSignOut },
                ]}
              />
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-indigo-600 border border-transparent rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              style={{ width: 80 }}
            >
              Sign in
            </Link>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="sm:hidden absolute top-0 inset-x-0 p-2 transition transform origin-top-right z-50 bg-white shadow-lg rounded-lg"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="main-menu"
        >
          <div className="pt-2 pb-3 space-y-1 relative">
            {/* cancel */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-600"
              >
                <span className="sr-only">Close menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            {mobileMenuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block pl-3 pr-4 py-2 border-l-4 text-base font-medium border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              >
                {item.label}
              </Link>
            ))}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {session ? (
                <div className="relative flex items-start justify-start">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-expanded={isUserMenuOpen}
                    aria-controls="user-menu"
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <span>{session.user?.name}</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <DropdownMenu
                    isOpen={isUserMenuOpen}
                    items={[
                      { href: "/dashboard/profile", label: "Profile" },
                      { href: "/dashboard/settings", label: "Settings" },
                      { label: "Sign out", action: handleSignOut },
                    ]}
                  />
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-indigo-600 border border-transparent rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  style={{ width: 80, height: 32 }}
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
