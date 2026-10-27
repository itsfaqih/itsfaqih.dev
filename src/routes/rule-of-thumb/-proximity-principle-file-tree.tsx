import { Verdict } from "./-components";
import { TreeNodeComponent, type TreeNode } from "./-proximity-principle-tree-node";

export function FileTreeComparison({
  badTree,
  badReason,
  goodTree,
  goodReason,
  showSingle = false,
}: {
  badTree?: TreeNode;
  badReason?: string;
  goodTree: TreeNode;
  goodReason: string;
  showSingle?: boolean;
}) {
  if (showSingle) {
    return (
      <Verdict good title="Organized Structure" reason={goodReason}>
        <div className="rk-pad">
          <TreeNodeComponent node={goodTree} />
        </div>
      </Verdict>
    );
  }

  return (
    <div className="rk-pair">
      <Verdict good={false} title="Bad" reason={badReason}>
        <div className="rk-pad">{badTree && <TreeNodeComponent node={badTree} />}</div>
      </Verdict>
      <Verdict good title="Good" reason={goodReason}>
        <div className="rk-pad">
          <TreeNodeComponent node={goodTree} />
        </div>
      </Verdict>
    </div>
  );
}
