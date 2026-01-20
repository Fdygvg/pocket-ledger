import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PieChart as PieChartIcon, TrendingUp, Info } from 'lucide-react';

// Curated vibrant color palette
const VIBRANT_COLORS = [
  '#FF6384', // Red/Pink
  '#36A2EB', // Blue
  '#FFCE56', // Yellow
  '#4BC0C0', // Teal
  '#9966FF', // Purple
  '#FF9F40', // Orange
  '#2ECC71', // Green
  '#C9CBCF', // Grey
  '#FF6B6B', // Coral
  '#4D5E80', // Dark Blue
];

interface PieChartData {
  label: string;
  value: number;
  color?: string;
  icon?: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  height?: number;
  className?: string;
  showLegend?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title = 'Spending Distribution',
  height = 300,
  className,
  showLegend = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [chartDimensions, setChartDimensions] = useState({ width: 300, height: 300 });

  // Calculate total using useMemo
  const total = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  // Process data with colors
  const processedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      color: item.color || VIBRANT_COLORS[index % VIBRANT_COLORS.length],
      // Ensure "Other" is clearly labeled if emoji/label is missing or generic
      label: item.label === '?' ? 'Untagged' : item.label
    }));
  }, [data]);

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // Maintain aspect ratio or max height
        const newHeight = Math.min(width, height);
        setChartDimensions({ width, height: newHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Draw pie chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || processedData.length === 0 || total === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = chartDimensions;

    // Set actual canvas size for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate center and radius
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4; // Slightly larger
    const hoverRadius = radius * 1.05;

    // Draw slices
    let startAngle = -Math.PI / 2; // Start from top
    processedData.forEach((slice, index) => {
      const sliceAngle = (slice.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const isHovered = hoveredSlice === index;

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(
        centerX,
        centerY,
        isHovered ? hoverRadius : radius,
        startAngle,
        endAngle
      );
      ctx.closePath();

      // Fill with color
      ctx.fillStyle = slice.color;
      ctx.fill();

      // Add border
      ctx.strokeStyle = 'white'; // Use background color
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Draw center hole for donut effect
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'white'; // Should match card background really, but white is distinct
    ctx.fill();

    // Add inner shadow/border to donut hole for polished look
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw total in center
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`₦${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, centerX, centerY - 10);

    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Total Sent', centerX, centerY + 12);

  }, [processedData, total, hoveredSlice, chartDimensions]);

  // Handle mouse move for hover effects
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { width, height } = chartDimensions;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate angle
    const angle = Math.atan2(y - centerY, x - centerX);
    // Normalize to 0 - 2PI, starting from -PI/2 (top)
    let normalizedAngle = angle + Math.PI / 2;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    // Find which slice is hovered
    let startAngle = 0;
    for (let i = 0; i < processedData.length; i++) {
      const sliceAngle = (processedData[i].value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      // Distance check to ignore corners and center hole
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = Math.min(width, height) * 0.4;

      if (distance <= radius * 1.1 && distance >= radius * 0.5 && normalizedAngle >= startAngle && normalizedAngle <= endAngle) {
        setHoveredSlice(i);
        return;
      }
      startAngle = endAngle;
    }

    setHoveredSlice(null);
  };

  const handleMouseLeave = () => {
    setHoveredSlice(null);
  };

  if (processedData.length === 0 || total === 0) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-muted-foreground" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/10 rounded-lg border border-dashed m-2">
            <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
              <Info className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-center font-medium">No spending data</p>
            <p className="text-sm text-center text-muted-foreground/80">Add bills to see analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden border-none shadow-none md:shadow-sm md:border', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-muted font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>{processedData.length} categories</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Chart Container */}
          <div ref={containerRef} className="relative flex-shrink-0 w-full md:w-1/2 flex justify-center">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer touch-none"
              style={{ maxWidth: '100%', maxHeight: height }}
            />

            {/* Hover tooltip */}
            {hoveredSlice !== null && (
              <div
                className="absolute bg-popover text-popover-foreground border shadow-xl rounded-lg p-3 pointer-events-none z-10 animate-in fade-in zoom-in-95 duration-200"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  minWidth: '140px',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="h-3 w-3 rounded-full shadow-sm"
                    style={{ backgroundColor: processedData[hoveredSlice].color }}
                  />
                  <div className="font-semibold text-sm flex items-center gap-1.5 truncate">
                    <span className="text-lg leading-none">{processedData[hoveredSlice].icon || '📝'}</span>
                    {processedData[hoveredSlice].label}
                  </div>
                </div>
                <div className="space-y-0.5 mt-2">
                  <div className="flex justify-between items-baseline gap-4 text-sm">
                    <span className="text-muted-foreground text-xs">Amount</span>
                    <span className="font-bold font-mono">
                      ₦{processedData[hoveredSlice].value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-4 text-sm">
                    <span className="text-muted-foreground text-xs">Share</span>
                    <span className="font-medium text-xs bg-primary/10 text-primary px-1.5 rounded">
                      {((processedData[hoveredSlice].value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {processedData
                  .sort((a, b) => b.value - a.value)
                  .map((slice, index) => {
                    const percentage = ((slice.value / total) * 100).toFixed(1);
                    const isHovered = hoveredSlice === index;

                    return (
                      <button
                        key={index}
                        className={cn(
                          'flex items-center justify-between p-2.5 rounded-lg transition-all w-full text-left border border-transparent',
                          isHovered ? 'bg-accent border-accent-foreground/10 shadow-sm scale-[1.02]' : 'hover:bg-muted/50'
                        )}
                        onMouseEnter={() => setHoveredSlice(index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-background shadow-sm border text-lg">
                            {slice.icon || '📝'}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold truncate leading-tight">
                              {slice.label}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div
                                className="h-1.5 w-12 rounded-full bg-muted overflow-hidden"
                              >
                                <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: slice.color }}></div>
                              </div>
                              <span className="text-[10px] text-muted-foreground font-medium">{percentage}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right font-mono text-sm font-semibold">
                          ₦{slice.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
