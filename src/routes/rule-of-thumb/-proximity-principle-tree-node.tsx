import { CaretRightIcon, FileIcon, FolderIcon } from "@phosphor-icons/react";
import { useState } from "react";

type TreeHighlight = "good" | "bad";

export type TreeNode = {
  name: string;
  children?: TreeNode[];
  highlight?: TreeHighlight;
};

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
  const indent = { paddingLeft: depth * 16 + 8 };
  const rowContent = (
    <>
      {hasChildren ? (
        <CaretRightIcon size={12} weight="bold" className="caret" />
      ) : (
        <span style={{ width: 12 }} />
      )}
      {hasChildren ? (
        <FolderIcon size={15} weight="duotone" className="dir" />
      ) : (
        <FileIcon size={15} />
      )}
      <span className={hasChildren ? "dir" : undefined}>{node.name}</span>
    </>
  );

  return (
    <div className={depth === 0 ? "rk-tree" : undefined}>
      {hasChildren ? (
        <button
          type="button"
          className="rk-tree-row"
          style={indent}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.name}`}
        >
          {rowContent}
        </button>
      ) : (
        <div className="rk-tree-row" style={indent}>
          {rowContent}
        </div>
      )}

      {hasChildren && (
        <div
          className="rk-tree-kids"
          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
          aria-hidden={!isOpen}
          inert={!isOpen}
        >
          <div>
            {groupByHighlight(children).map((group) => {
              const groupKey = `${group.highlight ?? "plain"}:${group.nodes.map((child) => child.name).join("|")}`;
              const groupContent = group.nodes.map((child) => (
                <TreeNodeComponent key={child.name} node={child} depth={depth + 1} />
              ));
              return group.highlight ? (
                <div key={groupKey} className={`rk-tree-mark ${group.highlight}`}>
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
