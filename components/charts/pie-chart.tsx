// "use client"

// import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// interface PieChartProps {
//   correct: number;
//   incorrect: number;
//   size?: number;
// }

// export function PieChart({ correct, incorrect, size = 260 }: PieChartProps) {
//   const total = correct + incorrect;
  
//   if (total === 0) {
//     return (
//       <div 
//         className="flex items-center justify-center rounded-full border-2 border-border bg-muted"
//         style={{ width: size, height: size }}
//       >
//         <p className="text-sm text-muted-foreground">No data</p>
//       </div>
//     );
//   }

//   const data = [
//     { name: 'Correct', value: correct, color: '#22c55e' },
//     { name: 'Incorrect', value: incorrect, color: '#ef4444' },
//   ];

//   const correctPercentage = ((correct / total) * 100).toFixed(0);

//   const renderCustomLabel = () => {
//     return (
//       <text
//         x="50%"
//         y="50%"
//         textAnchor="middle"
//         dominantBaseline="middle"
//       >
//         <tspan
//           x="50%"
//           dy="-0.5em"
//           className="text-5xl font-bold fill-green-600"
//           style={{ fontSize: '48px', fontWeight: 'bold' }}
//         >
//           {correctPercentage}%
//         </tspan>
//         <tspan
//           x="50%"
//           dy="1.8em"
//           className="text-sm fill-muted-foreground"
//           style={{ fontSize: '14px' }}
//         >
//           Accuracy
//         </tspan>
//       </text>
//     );
//   };

//   const CustomTooltip = ({ active, payload }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
//           <p className="text-sm font-semibold">{payload[0].name}</p>
//           <p className="text-sm text-muted-foreground">
//             {payload[0].value} ({((payload[0].value / total) * 100).toFixed(1)}%)
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const renderLegend = (props: any) => {
//     const { payload } = props;
//     return (
//       <div className="flex gap-6 justify-center text-sm mt-4">
//         {payload.map((entry: any, index: number) => (
//           <div key={`legend-${index}`} className="flex items-center gap-2">
//             <div 
//               className="h-4 w-4 rounded-full shadow-sm" 
//               style={{ backgroundColor: entry.color }}
//             />
//             <div>
//               <p className="text-xs text-muted-foreground">{entry.value}</p>
//               <p className="font-bold" style={{ color: entry.color }}>
//                 {entry.payload.value}
//               </p>
//             </div>
//           </div>
//         ))}
//         <div className="flex items-center gap-2">
//           <div className="h-4 w-4 rounded-full border-2 border-border bg-background" />
//           <div>
//             <p className="text-xs text-muted-foreground">Total</p>
//             <p className="font-bold">{total}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="flex flex-col items-center" style={{ width: size, height: size + 80 }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <RechartsPieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="45%"
//             innerRadius={size * 0.25}
//             outerRadius={size * 0.35}
//             paddingAngle={2}
//             dataKey="value"
//             animationBegin={0}
//             animationDuration={1000}
//             animationEasing="ease-out"
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip content={<CustomTooltip />} />
//           <Legend content={renderLegend} />
//           {renderCustomLabel()}
//         </RechartsPieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }



"use client"

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PieChartProps {
  correct: number;
  incorrect: number;
  size?: number;
}

export function PieChart({ correct, incorrect, size = 280 }: PieChartProps) {
  const total = correct + incorrect;

  if (total === 0) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground mb-2">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.08em' }}>
          No data yet
        </p>
      </div>
    );
  }

  const correctPct = ((correct / total) * 100).toFixed(1);
  const incorrectPct = ((incorrect / total) * 100).toFixed(1);
  const correctPctInt = Math.round((correct / total) * 100);

  const data = [
    { name: 'Correct', value: correct, color: '#10b981' },
    { name: 'Incorrect', value: incorrect, color: '#f43f5e' },
  ];

  const grade =
    correctPctInt >= 90 ? { label: 'Excellent', color: '#10b981' } :
    correctPctInt >= 75 ? { label: 'Good', color: '#3b82f6' } :
    correctPctInt >= 60 ? { label: 'Fair', color: '#f59e0b' } :
    { label: 'Needs Work', color: '#f43f5e' };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = ((item.value / total) * 100).toFixed(1);
      return (
        <div
          style={{
            background: 'var(--popover)',
            border: '1px solid hsl(var(--border))',
            borderRadius: '10px',
            padding: '10px 14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.payload.color, display: 'inline-block' }} />
            <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--foreground)' }}>{item.name}</span>
          </div>
          <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            <span style={{ fontWeight: 700, color: item.payload.color }}>{pct}%</span>
            <span style={{ marginLeft: 6 }}>({item.value} of {total})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const innerR = size * 0.27;
  const outerR = size * 0.40;

  return (
    <div
      style={{
        width: size,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Chart */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerR}
              outerRadius={outerR}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationBegin={0}
              animationDuration={900}
              animationEasing="ease-out"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: size * 0.16,
              fontWeight: 800,
              color: grade.color,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {correctPctInt}%
          </div>
          <div
            style={{
              fontSize: size * 0.053,
              color: 'hsl(var(--muted-foreground))',
              marginTop: 4,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Accuracy
          </div>
          <div
            style={{
              fontSize: size * 0.05,
              fontWeight: 600,
              color: grade.color,
              marginTop: 6,
              background: `${grade.color}18`,
              borderRadius: 100,
              padding: '2px 10px',
              display: 'inline-block',
            }}
          >
            {grade.label}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {/* <div
        style={{
          display: 'flex',
          gap: 10,
          marginTop: 4,
        }}
      > */}
        {/* Correct */}
        {/* <div
          style={{
            flex: 1,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 14,
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Correct
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#065f46', lineHeight: 1 }}>{correct}</div>
          <div style={{ fontSize: 12, color: '#6ee7b7', fontWeight: 500, marginTop: 2 }}>{correctPct}%</div>
        </div> */}

        {/* Incorrect */}
        {/* <div
          style={{
            flex: 1,
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 14,
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Incorrect
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#881337', lineHeight: 1 }}>{incorrect}</div>
          <div style={{ fontSize: 12, color: '#fda4af', fontWeight: 500, marginTop: 2 }}>{incorrectPct}%</div>
        </div> */}

        {/* Total */}
        {/* <div
          style={{
            flex: 1,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Total
            </span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500, marginTop: 2 }}>questions</div>
        </div> */}
      {/* </div> */}
    </div>
  );
}
