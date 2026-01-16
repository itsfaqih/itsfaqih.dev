import { useState } from "react";
import { PlusIcon, MinusIcon } from "@phosphor-icons/react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-zinc-800/50 border border-zinc-700 my-4">
      <button
        onClick={() => setCount(count - 1)}
        className="p-2 rounded-md hover:bg-zinc-700 text-zinc-400 hover:text-white active:scale-95 transition-all duration-200"
        aria-label="Decrease count"
      >
        <MinusIcon size={18} />
      </button>

      <div className="min-w-[80px] text-center">
        <span className="text-2xl font-bold text-white">{count}</span>
      </div>

      <button
        onClick={() => setCount(count + 1)}
        className="p-2 rounded-md bg-zinc-700 text-white hover:bg-zinc-600 active:scale-95 transition-all duration-200"
        aria-label="Increase count"
      >
        <PlusIcon size={18} />
      </button>
    </div>
  );
}
