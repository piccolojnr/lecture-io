"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      //   const response = await fetch("/api/profile", {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(profile),
      //   });
      //   if (!response.ok) {
      //     throw new Error("Failed to save profile");
      //   }
      //   setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {message && (
        <div className="mb-4 text-center text-sm font-medium text-green-500">
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="text-lg font-medium mb-2 block">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={profile.name}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-lg font-medium mb-2 block">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full p-2 border rounded-md"
            disabled
          />
          <p className="text-sm text-gray-500 mt-2">
            Your email cannot be changed.
          </p>
        </div>

        {/* Profile Picture */}
        <div>
          <label htmlFor="image" className="text-lg font-medium mb-2 block">
            Profile Picture
          </label>
          <input
            id="image"
            type="text"
            value={profile.image}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, image: e.target.value }))
            }
            className="w-full p-2 border rounded-md"
          />
          {profile.image && (
            <div className="mt-4">
              <Image
                src={profile.image}
                alt="Profile"
                className="w-16 h-16 rounded-full"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="text-right">
          <button
            onClick={saveProfile}
            disabled={isSaving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
