/**
 * GridBackground component - renders the 3D grid room effect with fading boxes
 */

import { cn } from "../cn";

// Configuration
const ROWS = 15;
const ROW_SPACING = 3; // Grid rows between each box row
const BOXES_PER_ROW = 3;
const CYCLE_DURATION = 15; // seconds for full animation cycle
const DELAY_PER_BOX = CYCLE_DURATION / BOXES_PER_ROW; // 5 seconds between each box

// Horizontal positions for boxes (spread across the grid width)
const LEFT_POSITIONS = [
  [2, 12, 22],
  [6, 16, 25],
  [3, 14, 20],
  [8, 18, 24],
  [1, 10, 21],
  [5, 15, 23],
  [2, 11, 19],
  [7, 17, 25],
  [4, 13, 22],
  [1, 9, 20],
  [6, 16, 24],
  [3, 12, 21],
  [8, 18, 25],
  [2, 14, 23],
  [5, 10, 19],
];

const RIGHT_POSITIONS = [
  [3, 13, 23],
  [7, 17, 25],
  [2, 11, 21],
  [6, 15, 24],
  [1, 10, 20],
  [5, 14, 22],
  [3, 12, 19],
  [8, 16, 25],
  [2, 11, 21],
  [6, 15, 23],
  [1, 9, 18],
  [4, 13, 22],
  [7, 17, 24],
  [2, 10, 20],
  [5, 14, 23],
];

interface FadeBoxProps {
  position: number;
  row: number;
  delay: number;
  side: "left" | "right";
}

function FadeBox({ position, row, delay, side }: FadeBoxProps) {
  const positionStyle =
    side === "left"
      ? { left: `calc(var(--cell-size) * ${position})` }
      : { right: `calc(var(--cell-size) * ${position})` };

  return (
    <div
      className="fade-box"
      style={{
        ...positionStyle,
        top: `calc(var(--cell-size) * ${row})`,
        ["--fade-delay" as string]: `${delay}s`,
        ["--fade-duration" as string]: `${CYCLE_DURATION}s`,
      }}
    />
  );
}

interface WallGridProps {
  side: "left" | "right";
}

function WallGrid({ side }: WallGridProps) {
  const positions = side === "left" ? LEFT_POSITIONS : RIGHT_POSITIONS;
  const className = side === "left" ? "grid-background-left" : "grid-background-right";

  // Offset for right wall to add variety
  const baseOffset = side === "right" ? 2.5 : 0;

  return (
    <div className={className}>
      {Array.from({ length: ROWS }, (_, rowIndex) => {
        const row = 1 + rowIndex * ROW_SPACING; // Grid row position
        const rowPositions = positions[rowIndex % positions.length];

        // Rotate which column fades first based on row
        // Row 0: order [0,1,2] -> left first
        // Row 1: order [1,2,0] -> middle first
        // Row 2: order [2,0,1] -> right first
        // This spreads the fading diagonally across the grid
        const columnOrder = [
          (0 + rowIndex) % BOXES_PER_ROW,
          (1 + rowIndex) % BOXES_PER_ROW,
          (2 + rowIndex) % BOXES_PER_ROW,
        ];

        return rowPositions.map((pos, boxIndex) => {
          // Find where this box appears in the fade order
          const fadeOrder = columnOrder.indexOf(boxIndex);
          // Add slight row offset to prevent all same-column boxes syncing
          const rowOffset = (rowIndex * 0.7) % DELAY_PER_BOX;

          return (
            <FadeBox
              key={`${side}-${rowIndex}-${boxIndex}`}
              position={pos}
              row={row}
              delay={baseOffset + rowOffset + fadeOrder * DELAY_PER_BOX}
              side={side}
            />
          );
        });
      })}
    </div>
  );
}

interface CeilingFloorBoxProps {
  col: number;
  row: number;
  delay: number;
  isFloor?: boolean;
}

function CeilingFloorBox({ col, row, delay, isFloor }: CeilingFloorBoxProps) {
  // Position boxes at grid intersections
  // The grid lines are at ±15 degrees and spaced at (cell-size / 0.966 / 2) intervals
  // Grid line intersections form a diamond pattern

  // The grid cell unit (half the ceiling-cell for line spacing)
  // Horizontal: lines repeat every (cell-size / 0.966 / 2)
  // Vertical: intersection points are every (cell-size / 0.966 / 2) / tan(15deg) ≈ cell-size / 0.966 / 2 / 0.268
  // But for simpler even/odd alignment: vertically every (cell-size / 0.966 / 2) works

  // Spread across full width - use larger column steps
  const centerCol = Math.floor(CEILING_COLS / 2);
  const colOffset = col - centerCol;

  // Each row of boxes: skip every 2 grid rows for spacing
  // Offset horizontal by half a cell on odd rows for diamond pattern
  const isOddRow = row % 2 === 1;
  const horizontalShift = isOddRow ? 0.5 : 0;

  // Grid cell step for positioning
  const cellStep = 2; // Position every 2 grid cells apart for spread

  const verticalStyle = isFloor
    ? { bottom: `calc(var(--cell-size) / 0.966 / 2 * ${(row + 1) * cellStep})` }
    : { top: `calc(var(--cell-size) / 0.966 / 2 * ${(row + 1) * cellStep})` };

  return (
    <div
      className={`fade-box ${isFloor ? "fade-box-floor" : "fade-box-ceiling"}`}
      style={{
        // Position horizontally with spread and diamond-pattern offset
        left: `calc(50% + var(--cell-size) / 0.966 / 2 * ${colOffset * cellStep + horizontalShift})`,
        transform: "translateX(-50%)",
        ...verticalStyle,
        ["--fade-delay" as string]: `${delay}s`,
        ["--fade-duration" as string]: `${CYCLE_DURATION}s`,
      }}
    />
  );
}

// Configuration for ceiling/floor grids - spread more columns across width
const CEILING_COLS = 11; // More columns for wider spread
const CEILING_ROWS = 3; // Fewer rows, more spread apart

function CeilingFloorGrid({ isFloor }: { isFloor?: boolean }) {
  const className = isFloor ? "grid-floor" : "grid-ceiling";
  const baseOffset = isFloor ? 1.5 : 0;

  return (
    <div className={className}>
      {Array.from({ length: CEILING_ROWS }, (_, rowIndex) =>
        Array.from({ length: CEILING_COLS }, (_, colIndex) => {
          // Rotate which column fades first based on row (same as walls)
          const columnOrder = [
            (0 + rowIndex) % BOXES_PER_ROW,
            (1 + rowIndex) % BOXES_PER_ROW,
            (2 + rowIndex) % BOXES_PER_ROW,
          ];
          const fadeOrder = columnOrder[colIndex % BOXES_PER_ROW];
          const rowOffset = (rowIndex * 1.2 + colIndex * 0.4) % DELAY_PER_BOX;

          return (
            <CeilingFloorBox
              key={`${isFloor ? "floor" : "ceiling"}-${rowIndex}-${colIndex}`}
              col={colIndex}
              row={rowIndex}
              delay={baseOffset + rowOffset + fadeOrder * DELAY_PER_BOX}
              isFloor={isFloor}
            />
          );
        }),
      )}
    </div>
  );
}

export default function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient fade overlay for edges */}
      <div
        className={cn(
          "absolute inset-0 h-full pointer-events-none z-1",
          "dark:bg-[radial-gradient(ellipse_at_center,rgb(15,15,17)_0%,rgb(15,15,17)_45%,rgba(15,15,17,0)_100%)]",
          "bg-[radial-gradient(ellipse_at_center,rgb(250,250,250)_0%,rgb(250,250,250)_45%,rgba(250,250,250,0)_100%)]",
        )}
      />

      {/* Wall grids with fading boxes */}
      <WallGrid side="left" />
      <WallGrid side="right" />

      {/* Ceiling and floor grids with fading boxes */}
      <CeilingFloorGrid />
      <CeilingFloorGrid isFloor />
    </div>
  );
}
