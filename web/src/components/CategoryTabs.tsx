const categories = [
  { id: "all", name: "ALL", count: 4443 },
  { id: "dexs", name: "DEXS", count: 847, color: "text-[#00ff88]" },
  { id: "lending", name: "LEND", count: 312, color: "text-[#ff88ff]" },
  { id: "liquid-staking", name: "STAKE", count: 156, color: "text-[#ffaa00]" },
  { id: "bridge", name: "BRIDGE", count: 89, color: "text-[#00aaff]" },
  { id: "derivatives", name: "DERIV", count: 134, color: "text-[#ffff00]" },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  return (
    <div className="flex items-center gap-1 overflow-x-auto text-sm">
      {categories.map((cat, i) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`px-2 py-1 whitespace-nowrap transition-colors ${
            activeCategory === cat.id
              ? `${cat.color || "text-primary"} bg-accent`
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          [{cat.name}:{cat.count}]
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;
