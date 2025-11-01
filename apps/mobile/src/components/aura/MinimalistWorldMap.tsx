import React from 'react';
import { Svg, Path, Circle, G } from 'react-native-svg';

interface MinimalistWorldMapProps {
  width: number;
  height: number;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * MinimalistWorldMap - Simplified world continents in line art style
 *
 * Design: Clean vector outlines of major continents
 * - Matches Aura's minimalist aesthetic
 * - Simple stroke-based design (no fill)
 * - Optimized for animation
 */
const MinimalistWorldMap: React.FC<MinimalistWorldMapProps> = ({
  width,
  height,
  strokeColor = 'rgba(255, 255, 255, 0.3)',
  strokeWidth = 1,
}) => {
  // Simplified continent paths (approximate shapes, centered around 0,0 in 360x180 coordinate system)
  // These are highly simplified versions for minimalist aesthetic

  return (
    <Svg width={width} height={height} viewBox="0 0 360 180">
      <G>
        {/* North America - simplified outline */}
        <Path
          d="M 50,40 L 60,35 L 70,30 L 80,28 L 90,30 L 95,35 L 100,45 L 105,60 L 110,75 L 105,90 L 95,100 L 85,105 L 75,100 L 65,95 L 60,85 L 55,70 L 50,55 Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* South America - simplified */}
        <Path
          d="M 85,110 L 95,115 L 100,125 L 102,140 L 100,155 L 95,165 L 85,170 L 75,165 L 70,155 L 68,140 L 70,125 L 75,115 Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Europe - simplified */}
        <Path
          d="M 165,30 L 175,28 L 185,30 L 190,35 L 195,45 L 192,55 L 185,60 L 175,58 L 168,52 L 165,42 Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Africa - simplified */}
        <Path
          d="M 175,65 L 185,68 L 195,75 L 200,90 L 202,110 L 200,130 L 195,145 L 185,155 L 175,158 L 168,152 L 162,140 L 160,120 L 162,95 L 168,75 Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Asia - simplified large mass */}
        <Path
          d="M 200,25 L 220,20 L 240,22 L 260,25 L 280,30 L 295,38 L 305,50 L 310,65 L 308,80 L 300,90 L 285,95 L 270,92 L 255,85 L 245,75 L 235,60 L 225,45 L 215,35 Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Australia - simplified */}
        <Path
          d="M 270,125 L 285,123 L 300,127 L 310,135 L 312,145 L 308,155 L 295,160 L 280,158 L 270,150 L 268,138 Z"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Equator line - subtle reference */}
        <Path
          d="M 10,90 L 350,90"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.5}
          fill="none"
          opacity={0.2}
          strokeDasharray="5,5"
        />
      </G>
    </Svg>
  );
};

export default MinimalistWorldMap;
