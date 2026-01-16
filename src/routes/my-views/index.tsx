import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { GlassyCard } from "../../components/glassy-card";
import { GUIDELINES } from "../../data/guidelines";
import { PageContainer } from "../../components/page-container";
import { GuidelineHero } from "./-components";
import { MagnifyingGlassIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { GuidelineCard } from "../../components/guideline-card";

export const Route = createFileRoute("/my-views/")({
  component: MyViewsIndex,
});

function MyViewsIndex() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGuidelines = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return GUIDELINES.filter((guideline) => {
      return (
        guideline.title.toLowerCase().includes(query) ||
        guideline.description.toLowerCase().includes(query) ||
        guideline.label.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  return (
    <PageContainer maxWidth="4xl">
      <GuidelineHero
        title="My Views"
        description="A collection of opinions, guidelines, and patterns I've adopted for building high-quality web applications."
        badge={{
          icon: SquaresFourIcon,
          text: `${GUIDELINES.length} Guidelines`,
        }}
      />

      {/* Search Filter */}
      <div className="mb-12">
        <GlassyCard
          className="max-w-md mx-auto flex items-center gap-3 px-4 py-3"
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
          <p className="text-(--text-secondary)">No guidelines found matching "{searchQuery}"</p>
        </div>
      )}
    </PageContainer>
  );
}
