import { cx } from "@/stylex";
import {
  CaretRightIcon,
  FileIcon,
  FolderIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

type TreeHighlight = "good" | "bad";

export type TreeNode = {
  name: string;
  children?: TreeNode[];
  highlight?: TreeHighlight;
};

const TREE_HIGHLIGHT_STYLES = {
  good: "bg-positive/10 text-positive-foreground",
  bad: "bg-negative/10 text-negative-foreground",
} as const;

const TREE_BORDER_STYLES = {
  good: "border-l-2 border-positive",
  bad: "border-l-2 border-negative",
} as const;

function groupByHighlight(children: TreeNode[]) {
  const groups: { highlight?: TreeHighlight; nodes: TreeNode[] }[] = [];
  for (const child of children) {
    const last = groups[groups.length - 1];
    if (last && last.highlight === child.highlight) {
      last.nodes.push(child);
    } else {
      groups.push({ highlight: child.highlight, nodes: [child] });
    }
  }
  return groups;
}

export function TreeNodeComponent({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const rowClassName = cx(
    `flex items-center gap-1.5 py-1 px-2 rounded-md transition-all cursor-default hover:bg-muted/50 ${
      node.highlight ? TREE_HIGHLIGHT_STYLES[node.highlight] : ""
    }`,
  );
  const rowContent = (
    <>
      {hasChildren ? (
        <CaretRightIcon
          size={14}
          weight="regular"
          className={cx(`tree-caret text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`)}
        />
      ) : (
        <span className={cx("w-3.5")} />
      )}

      {hasChildren ? (
        <FolderIcon size={14} weight="regular" className={cx("text-foreground")} />
      ) : (
        <FileIcon size={14} weight="regular" className={cx("text-muted-foreground")} />
      )}

      <span className={cx("text-sm font-mono")}>{node.name}</span>
    </>
  );

  return (
    <div className={cx("select-none")}>
      {hasChildren ? (
        <button
          type="button"
          className={cx(rowClassName, "w-full text-left")}
          style={{ paddingLeft: depth * 16 + 8 }}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.name}`}
        >
          {rowContent}
        </button>
      ) : (
        <div className={rowClassName} style={{ paddingLeft: depth * 16 + 8 }}>
          {rowContent}
        </div>
      )}

      {hasChildren && (
        <div
          className={cx("tree-children grid")}
          style={{
            gridTemplateRows: isOpen ? "1fr" : "0fr",
            opacity: isOpen ? 1 : 0,
          }}
          aria-hidden={!isOpen}
          inert={!isOpen}
        >
          <div className={cx("overflow-hidden")}>
            {groupByHighlight(children).map((group) => {
              const groupKey = `${group.highlight ?? "plain"}:${group.nodes.map((child) => child.name).join("|")}`;
              const groupContent = group.nodes.map((child) => (
                <TreeNodeComponent key={child.name} node={child} depth={depth + 1} />
              ));

              return group.highlight ? (
                <div key={groupKey} className={TREE_BORDER_STYLES[group.highlight]}>
                  {groupContent}
                </div>
              ) : (
                <div key={groupKey}>{groupContent}</div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
