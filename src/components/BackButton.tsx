"use client";
import { useRouter } from "next/navigation"; // Usage: App router

export default function BackButton({
  label,
  type,
}: {
  label?: string;
  type?: "contained" | "outlined" | "text";
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`${
        type === "contained"
          ? "bg-indigo-600 text-white hover:bg-indigo-700  px-4 py-2 rounded-md"
          : type === "outlined"
          ? "border border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white  px-4 py-2 rounded-md"
          : "text-indigo-600 hover:text-indigo-800"
      }`}
    >
      {label || "Back"}
    </button>
  );
}
