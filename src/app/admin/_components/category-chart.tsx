
'use client';

import { Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Cell } from "recharts";

export function CategoryChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Tooltip
            cursor={{fill: 'hsl(var(--muted))'}}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
            }}
        />
        <Legend />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
          fill="hsl(var(--primary))"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
            {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

    