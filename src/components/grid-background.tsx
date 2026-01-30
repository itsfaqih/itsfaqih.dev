import { cn } from "../cn";

// Configuration
const ROWS = 15;
const ROW_SPACING = 3; // Grid rows between each box row
const BOXES_PER_ROW = 3;
const CYCLE_DURATION = 15; // seconds for full animation cycle
const DELAY_PER_BOX = CYCLE_DURATION / BOXES_PER_ROW; // 5 seconds between each box

// Horizontal positions for boxes (spread across the grid width)
// These define the specific grid column indices where boxes should appear
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

type FadeBoxProps = {
  position: number;
  row: number;
  delay: number;
  side: "left" | "right";
};

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

type WallGridProps = {
  side: "left" | "right";
};

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

        if (!rowPositions) return null;

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

// Configuration for ceiling/floor grids - spread more columns across width
// Tiles removed as per request, but keeping component for grid lines

function CeilingFloorGrid({ isFloor }: { isFloor?: boolean }) {
  const className = isFloor ? "grid-floor" : "grid-ceiling";

  return <div className={className} />;
}

export function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient fade overlay for edges */}
      <div
        className={cn(
          "absolute inset-0 h-full pointer-events-none z-1",
          "bg-[linear-gradient(to_right,transparent_0%,var(--background)_25%,var(--background)_75%,transparent_100%)] opacity-80",
        )}
      />

      {/* Vertical gradient wash */}
      <div
        className={cn(
          "absolute inset-0 w-full pointer-events-none z-1",
          "bg-[linear-gradient(to_bottom,transparent_0%,var(--background)_25%,var(--background)_75%,transparent_100%)] opacity-80",
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
