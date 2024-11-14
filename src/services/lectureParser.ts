import { Lecture, Slide, Topic } from '../types';

export class LectureParser {

    static async parseTopic(json: any): Promise<Topic | null> {
        try {
            // Validate the JSON structure
            if (!json.title || !json.keyPoints || !Array.isArray(json.keyPoints)) {
                throw new Error("Invalid file format. Expected a topic with title and key points.");
            }

            // Parse and structure the topic data
            const topic: Topic = {
                id: json.id,
                title: json.title,
                keyPoints: json.keyPoints,
                status: "not_started",
            };

            return topic;
        } catch (error) {
            console.error('Error parsing topic:', error);
            throw new Error('Failed to parse topic');
        }
    }

    static async parseSlide(json: any): Promise<Slide | null> {
        try {
            // Validate the JSON structure
            if (!json.content) {
                throw new Error("Invalid file format. Expected a slide with content.");
            }

            // Parse and structure the slide data
            const slide: Slide = {
                id: json.id,
                content: json.content,
                notes: json.notes,
                imageUrl: json.imageUrl,
            };

            return slide;
        } catch (error) {
            console.error('Error parsing slide:', error);
            throw new Error('Failed to parse slide');
        }
    }

    static async parseLecture(json: any): Promise<Lecture | null> {
        try {
            // Validate the JSON structure
            if (!json.title) {
                throw new Error("Invalid file format. Expected a lecture with title, topics, and slides.");
            }

            // Validate the JSON structure
            if (!json.topics || !json.slides) {
                throw new Error("Invalid file format. Expected a lecture with topics and slides.");
            }

            const slides: Slide[] = await Promise.all(json.slides.map(async (item: any) => await this.parseSlide(item)))
            const topics: Topic[] = await Promise.all(json.topics.map(async (item: any) => await this.parseTopic(item)))


            // Parse and structure the lecture data
            const lecture: Lecture = {
                title: json.title,
                topics,
                slides,
                status: "not_started",
                progress: 0,
            };

            return lecture;
        } catch (error) {
            console.error('Error parsing lecture:', error);
            throw new Error('Failed to parse lecture');
        }

    }

    static async parseLectures(fileContent: string): Promise<Lecture[] | null> {
        try {
            const json = JSON.parse(fileContent);

            // Validate the JSON structure
            if (!Array.isArray(json)) {
                throw new Error("Invalid file format. Expected an array of lectures.");
            }

            const lectures: Lecture[] = [];
            for (const item of json) {
                const lecture = await this.parseLecture(item);
                if (lecture) lectures.push(lecture);
            }

            return lectures;
        } catch (error) {
            console.error('Error parsing lectures:', error);
            throw new Error('Failed to parse lectures');
        }
    }

}
