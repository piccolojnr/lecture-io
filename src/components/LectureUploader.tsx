import { Lecture } from "../types";
import { LectureParser } from "@/services/lectureParser";
import { useLectures } from "@/contexts/LectureContext";

const LectureUploader = () => {
  const { addLectures, fetchLectures, isLoading, error } = useLectures();

  const handleFileUploadLectures = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const parsedLectures: Lecture[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        const fileContent = await new Promise<string>((resolve, reject) => {
          reader.onload = (event) => {
            if (event.target) {
              resolve(event.target.result as string);
            } else {
              reject("Failed to read file");
            }
          };

          reader.onerror = () => reject("Failed to read file");
          reader.readAsText(file);
        });

        const lectures = await LectureParser.parseLectures(fileContent);
        if (lectures) {
          parsedLectures.push(...lectures);
        }
      }

      await addLectures(parsedLectures);
      await fetchLectures();
    } catch (err) {
      console.error("Parsing error:", err);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <label className="block mb-4">
        <span className="text-gray-700">Upload Lecture Files</span>
        <input
          type="file"
          multiple
          accept=".json"
          onChange={handleFileUploadLectures}
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-white
            hover:file:bg-primary/90"
        />
      </label>

      {isLoading && <div className="text-gray-600">Processing lectures...</div>}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default LectureUploader;
