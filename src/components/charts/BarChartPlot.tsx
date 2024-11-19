"use client";
import moment from "moment";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

interface QuizAverageScoreBarChartPlotProps {
  data: {
    name: string;
    value: number;
  }[];
}

export const QuizAverageScoreBarChartPlot = ({
  data,
}: QuizAverageScoreBarChartPlotProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

type QuizScoreBarChartPlotProps = {
  data: {
    date: string;
    score: number;
    lecture: string;
  }[];
};

export const QuizScoreBarChartPlot = ({ data }: QuizScoreBarChartPlotProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => moment(value).format("MMM D")}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="score" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// flashcardMastery bar chart
interface FlashcardMasteryBarChartPlotProps {
  data: {
    lecture: string;
    mastered: number;
  }[];
}
export const FlashcardMasteryBarChartPlot = ({
  data,
}: FlashcardMasteryBarChartPlotProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="lecture" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="mastered" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};
