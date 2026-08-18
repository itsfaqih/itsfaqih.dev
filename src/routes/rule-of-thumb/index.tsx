import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Card } from "../../components/card";
import { GUIDELINES } from "../../data/guidelines";
import { PageContainer } from "../../components/page-container";
import { RuleOfThumbHero } from "./-components";
import {
  MagnifyingGlassIcon,
  SquaresFourIcon,
  CaretDownIcon,
  XIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import { RuleOfThumbCard } from "../../components/rule-of-thumb-card";
import { Combobox } from "@base-ui/react/combobox";

export const Route = createFileRoute("/rule-of-thumb/")({
  component: RuleOfThumbsIndex,
});

// Type for category items
type CategoryItem = {
  label: string;
  value: string;
};

// Get visible guidelines (not hidden)
const VISIBLE_GUIDELINES = GUIDELINES.filter((g) => !g.hidden);

// Extract unique categories from visible guidelines
const CATEGORIES: CategoryItem[] = [...new Set(VISIBLE_GUIDELINES.map((g) => g.label))].map(
  (label) => ({
    label,
    value: label,
  }),
);

function RuleOfThumbsIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategoryItem[]>([]);

  const filteredGuidelines = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const selectedLabels = selectedCategories.map((c) => c.label);

    return VISIBLE_GUIDELINES.filter((guideline) => {
      const matchesSearch =
        guideline.title.toLowerCase().includes(query) ||
        guideline.description.toLowerCase().includes(query) ||
        guideline.label.toLowerCase().includes(query);

      const matchesCategory =
        selectedLabels.length === 0 || selectedLabels.includes(guideline.label);

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategories]);

  return (
    <PageContainer maxWidth="4xl">
      <RuleOfThumbHero
        title="Rule of Thumb"
        description="A collection of opinions, guidelines, and patterns I've adopted for building high-quality web applications."
        badge={{
          icon: SquaresFourIcon,
          text: `${VISIBLE_GUIDELINES.length} Guidelines`,
        }}
      />

      {/* Filters */}
      <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Search Filter */}
        <Card
          className="w-full sm:w-auto sm:min-w-[280px] flex items-center gap-3 px-4 py-3"
          hoverEffect={false}
        >
          <MagnifyingGlassIcon size={20} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm"
          />
        </Card>

        {/* Category Filter */}
        <Combobox.Root
          multiple
          value={selectedCategories}
          onValueChange={setSelectedCategories}
          items={CATEGORIES}
        >
          <Card
            className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-[280px] flex items-center gap-2 px-4 py-2.5"
            hoverEffect={false}
          >
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-1.5 min-w-0 max-w-[160px]">
                <div className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-background border border-border text-foreground whitespace-nowrap overflow-hidden">
                  <span className="truncate">{selectedCategories[0]!.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategories(
                        selectedCategories.filter((c) => c.value !== selectedCategories[0]!.value),
                      );
                    }}
                    className="shrink-0 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <XIcon size={12} weight="bold" />
                  </button>
                </div>
                {selectedCategories.length > 1 && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    +{selectedCategories.length - 1} more
                  </span>
                )}
              </div>
            )}
            <Combobox.Input
              placeholder={selectedCategories.length > 0 ? "" : "Filter by category..."}
              className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-foreground placeholder-muted-foreground text-sm"
            />
            <Combobox.Trigger className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <CaretDownIcon size={16} />
            </Combobox.Trigger>
          </Card>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={8} className="z-50">
              <Combobox.Popup className="rounded-xl border border-border backdrop-blur-xl shadow-lg overflow-hidden min-w-[200px] bg-white dark:bg-zinc-900">
                <Combobox.Empty>
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    No categories found.
                  </div>
                </Combobox.Empty>
                <Combobox.List>
                  <Combobox.Collection>
                    {(item: CategoryItem) => (
                      <Combobox.Item
                        key={item.value}
                        value={item}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-foreground cursor-pointer transition-colors data-highlighted:bg-background data-selected:bg-background"
                      >
                        <span>{item.label}</span>
                        <Combobox.ItemIndicator className="size-4 flex items-center justify-center">
                          <CheckIcon size={14} weight="bold" />
                        </Combobox.ItemIndicator>
                      </Combobox.Item>
                    )}
                  </Combobox.Collection>
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      {/* Grid */}
      {filteredGuidelines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuidelines.map((guideline) => (
            <div key={guideline.id} className="flex justify-center">
              <RuleOfThumbCard ruleOfThumb={guideline} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No guidelines found
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategories.length > 0 && ` in selected categories`}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
