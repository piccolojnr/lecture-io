import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useLectures } from "@/contexts/LectureContext";

const Progress = () => {
  const { lectures, fetchLectures } = useLectures();

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Study Progress</h1>

        <div className="space-y-4">
          {lectures.data.map((lecture) => (
            <div key={lecture.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{lecture.title}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    lecture.status === "understood"
                      ? "bg-green-100 text-green-800"
                      : lecture.status === "review_needed"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {lecture.status.replace("_", " ")}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${lecture.progress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Progress: {lecture.progress}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Progress;
