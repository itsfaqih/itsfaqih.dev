import { cx } from "@/stylex";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { Card } from "../../components/card";
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
      <Card className={cx("overflow-hidden")}>
        <div className={cx("px-4 py-3 border-b border-border flex items-center gap-2")}>
          <CheckIcon size={14} className={cx("inline mr-2")} />
          <span className={cx("font-medium text-foreground")}>Organized Structure</span>
        </div>
        <div className={cx("p-4")}>
          <TreeNodeComponent node={goodTree} />
        </div>
        <div className={cx("px-4 py-3 bg-positive/10 border-t border-border text-sm text-positive-foreground flex items-start gap-2")}>
          <CheckIcon size={14} className={cx("shrink-0 mt-0.5")} />
          <span>{goodReason}</span>
        </div>
      </Card>
    );
  }

  return (
    <div className={cx("flex flex-col items-center lg:grid lg:grid-cols-2 gap-4")}>
      <Card
        className={cx("border-negative/30 bg-card/30 hover:border-negative/30 overflow-hidden")}
        hoverEffect={false}
      >
        <div className={cx("px-4 py-3 border-b border-negative/30 bg-negative/10 flex items-center gap-2")}>
          <XIcon size={16} className={cx("text-negative-foreground")} />
          <span className={cx("font-medium text-negative-foreground")}>Bad</span>
        </div>
        <div className={cx("p-4")}>{badTree && <TreeNodeComponent node={badTree} />}</div>
        <div className={cx("px-4 py-3 border-t border-negative/30 bg-negative/10 text-sm text-negative-foreground flex items-start gap-2")}>
          <XIcon size={14} className={cx("shrink-0 mt-1")} />
          <span>{badReason}</span>
        </div>
      </Card>

      <Card
        className={cx("border-positive/30 bg-card/30 hover:border-positive/30 overflow-hidden")}
        hoverEffect={false}
      >
        <div className={cx("px-4 py-3 border-b border-positive/30 bg-positive/10 flex items-center gap-2")}>
          <CheckIcon size={16} className={cx("text-positive-foreground")} />
          <span className={cx("font-medium text-positive-foreground")}>Good</span>
        </div>
        <div className={cx("p-4")}>
          <TreeNodeComponent node={goodTree} />
        </div>
        <div className={cx("px-4 py-3 border-t border-positive/30 bg-positive/10 text-sm text-positive-foreground flex items-start gap-2")}>
          <CheckIcon size={14} className={cx("shrink-0 mt-0.5")} />
          <span>{goodReason}</span>
        </div>
      </Card>
    </div>
  );
}
