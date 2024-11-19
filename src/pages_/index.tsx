import Link from "next/link";
import React from "react";

const IndexPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Lecture IO</h1>
      <p className="text-lg text-gray-700 text-center max-w-md">
        Welcome to the Lecture IO management system. Here you can manage your
        lectures efficiently.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-500 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
};

export default IndexPage;
