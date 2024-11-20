"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import MindMapCreator from "@/components/MindMapCreator";

interface MindMapData {
  id: string;
  title: string;
  lectureId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function MindMapsPage() {
  const { data: session, status } = useSession();
  const [mindMaps, setMindMaps] = useState<MindMapData[]>([]);
  const [selectedMap, setSelectedMap] = useState<MindMapData | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      redirect("/auth/signin");
    }

    // Fetch user's mind maps
    const fetchMindMaps = async () => {
      try {
        const response = await fetch("/api/mindmaps");
        const data = await response.json();
        setMindMaps(data);
      } catch (error) {
        console.error("Failed to fetch mind maps:", error);
      }
    };

    fetchMindMaps();
  }, [session, status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mind Maps</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mind Maps List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Mind Maps
            </h2>
            <div className="space-y-2">
              {mindMaps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => setSelectedMap(map)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedMap?.id === map.id
                      ? "bg-indigo-50 border-indigo-500"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{map.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(map.updatedAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mind Map Editor */}
        <div className="lg:col-span-3">
          <MindMapCreator />
        </div>
      </div>
    </div>
  );
}
