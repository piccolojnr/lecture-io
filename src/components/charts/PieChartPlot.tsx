"use client";
import moment from "moment";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

type Props = {
  data: {
    name: string;
    value: number;
  }[];
};

const PieChartPlot = ({ data }: Props) => {
  return (
    <>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={730} height={250}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            fill="#8884d8"
            label={({ value }) =>
              `${moment
                .duration(value.toFixed(2), "seconds")
                .asMinutes()
                .toFixed(1)} min`
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              ></Cell>
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active) {
    return (
      <>
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "white",
            padding: "5px 10px",
            border: "1px solid #cccccc",
            borderRadius: "5px",
            pointerEvents: "none",
          }}
        >
          <p
            className="label"
            style={{ color: COLORS[0], fontWeight: "bold", fontSize: "12px" }}
          >
            {payload[0]["name"]}
          </p>
        </div>
      </>
    );
  }
  return null;
};

export default PieChartPlot;
