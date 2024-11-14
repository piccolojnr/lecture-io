import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Study Assistant
            </Link>
          </div>

          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
