import { CommandPaletteView } from "./command-palette-view";
import { useCommandPalette } from "./command-palette-model";

export function CommandPalette() {
  const model = useCommandPalette();
  return <CommandPaletteView {...model} />;
}
