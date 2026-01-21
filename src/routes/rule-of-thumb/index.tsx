import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { GlassyCard } from "../../components/glassy-card";
import { GUIDELINES } from "../../data/guidelines";
import { PageContainer } from "../../components/page-container";
import { GuidelineHero } from "./-components";
import { MagnifyingGlassIcon, SquaresFourIcon, CaretDown, X, Check } from "@phosphor-icons/react";
import { GuidelineCard } from "../../components/guideline-card";
import { Combobox } from "@base-ui/react/combobox";

export const Route = createFileRoute("/rule-of-thumb/")({
  component: RuleOfThumbsIndex,
});

// Type for category items
interface CategoryItem {
  label: string;
  value: string;
}

// Extract unique categories from guidelines
const CATEGORIES: CategoryItem[] = [...new Set(GUIDELINES.map((g) => g.label))].map((label) => ({
  label,
  value: label,
}));

function RuleOfThumbsIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<CategoryItem[]>([]);

  const filteredGuidelines = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const selectedLabels = selectedCategories.map((c) => c.label);

    return GUIDELINES.filter((guideline) => {
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
      <GuidelineHero
        title="Rule of Thumb"
        description="A collection of opinions, guidelines, and patterns I've adopted for building high-quality web applications."
        badge={{
          icon: SquaresFourIcon,
          text: `${GUIDELINES.length} Guidelines`,
        }}
      />

      {/* Filters */}
      <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Search Filter */}
        <GlassyCard
          className="w-full sm:w-auto sm:min-w-[280px] flex items-center gap-3 px-4 py-3"
          hoverEffect={false}
        >
          <MagnifyingGlassIcon size={20} className="text-(--text-secondary)" />
          <input
            type="text"
            placeholder="Search guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-(--text-primary) placeholder-(--text-secondary) text-sm"
          />
        </GlassyCard>

        {/* Category Filter */}
        <Combobox.Root
          multiple
          value={selectedCategories}
          onValueChange={setSelectedCategories}
          items={CATEGORIES}
        >
          <GlassyCard
            className="w-full sm:w-auto sm:min-w-[280px] sm:max-w-[280px] flex items-center gap-2 px-4 py-2.5"
            hoverEffect={false}
          >
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-1.5 min-w-0 max-w-[160px]">
                <div className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-(--bg-primary) border border-(--border-color) text-(--text-primary) whitespace-nowrap overflow-hidden">
                  <span className="truncate">{selectedCategories[0].label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCategories(
                        selectedCategories.filter((c) => c.value !== selectedCategories[0].value),
                      );
                    }}
                    className="shrink-0 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X size={12} weight="bold" />
                  </button>
                  b
                </div>
                {selectedCategories.length > 1 && (
                  <span className="text-xs text-(--text-secondary) whitespace-nowrap">
                    +{selectedCategories.length - 1} more
                  </span>
                )}
              </div>
            )}
            <Combobox.Input
              placeholder={selectedCategories.length === 0 ? "Filter by category..." : ""}
              className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-(--text-primary) placeholder-(--text-secondary) text-sm"
            />
            <Combobox.Trigger className="text-(--text-secondary) hover:text-(--text-primary) transition-colors cursor-pointer">
              <CaretDown size={16} />
            </Combobox.Trigger>
          </GlassyCard>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={8} className="z-50">
              <Combobox.Popup className="rounded-xl border border-(--border-color) backdrop-blur-xl shadow-lg overflow-hidden min-w-[200px] bg-white dark:bg-zinc-900">
                <Combobox.Empty className="px-4 py-3 text-sm text-(--text-secondary)">
                  No categories found.
                </Combobox.Empty>
                <Combobox.List className="p-1.5">
                  <Combobox.Collection>
                    {(item: CategoryItem) => (
                      <Combobox.Item
                        key={item.value}
                        value={item}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-(--text-primary) cursor-pointer transition-colors data-highlighted:bg-(--bg-primary) data-selected:bg-(--bg-primary)"
                      >
                        <span>{item.label}</span>
                        <Combobox.ItemIndicator className="w-4 h-4 flex items-center justify-center">
                          <Check size={14} weight="bold" />
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
              <GuidelineCard guideline={guideline} style={{ width: "100%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-(--text-secondary)">
            No guidelines found
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategories.length > 0 && ` in selected categories`}
          </p>
        </div>
      )}
    </PageContainer>
  );
}
