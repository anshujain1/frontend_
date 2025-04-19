"use client";

import { useState, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
import creativeData from "../public/data.json";

// Helper: Parse a tags string into key-value pairs
function parseTags(tagsString) {
  if (!tagsString || typeof tagsString !== "string") return {};
  return tagsString.split(";").reduce((acc, tag) => {
    const [key, value] = tag.split(":").map((s) => s.trim());
    if (key && value) {
      if (!acc[key]) acc[key] = new Set();
      acc[key].add(value);
    }
    return acc;
  }, {});
}

function aggregateFilters(data) {
  const tagOptions = {};
  const metrics = [
    "spend",
    "impressions",
    "clicks",
    "ipm",
    "ctr",
    "cpm",
    "cost_per_click",
    "cost_per_install",
    "installs",
  ];
  data.forEach((creative) => {
    const tagsObj = parseTags(creative.tags);
    Object.entries(tagsObj).forEach(([key, values]) => {
      if (!tagOptions[key]) tagOptions[key] = new Set();
      values.forEach((v) => tagOptions[key].add(v));
    });
  });

  // Convert all sets to arrays
  Object.keys(tagOptions).forEach(
    (key) => (tagOptions[key] = Array.from(tagOptions[key]))
  );

  // Grouping logic: adjust as needed for your UI
  const filterCategories = {
    Dimensions: [
      "Concept",
      "Audio - Type",
      "Audio - Language",
      "End card elements - Objects",
      "End card elements - Language",
      "End card elements - Logo present",
      "End card elements - Background setting",
    ].filter((k) => tagOptions[k]),
    CTA: [
      "End card elements - CTA",
      "End card elements - CTA Placement",
      "End card elements - CTA background colour",
    ].filter((k) => tagOptions[k]),
    Background: [
      "End card elements - Background Colour",
    ].filter((k) => tagOptions[k]),
    Metrics: metrics,
  };

  return { filterCategories, tagOptions, metrics };
}

const conditions = ["Equals", "Greater than", "Lesser than"];

export default function FilterDropdown() {
  // Aggregate filter options from data
  const { filterCategories, tagOptions, metrics } = useMemo(
    () => aggregateFilters(creativeData),
    []
  );

  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState("Equals");
  const [selectedTags, setSelectedTags] = useState([]);
  const [metricValue, setMetricValue] = useState("");
  const [filters, setFilters] = useState([]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const applyFilter = () => {
    if (selectedCategory && selectedSub) {
      const value =
        filterCategories.Metrics.includes(selectedSub)
          ? metricValue
          : selectedTags.join(", ");
      if (value) {
        setFilters((prev) => [
          ...prev,
          {
            category: selectedCategory,
            sub: selectedSub,
            condition: selectedCondition,
            value,
          },
        ]);
        // Reset
        setSelectedCategory(null);
        setSelectedSub(null);
        setSelectedTags([]);
        setMetricValue("");
        setSelectedCondition("Equals");
        setIsOpen(false);
      }
    }
  };

  const removeFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  // UI
  return (
    <div className="bg-gray-100 rounded-2xl p-1 flex justify-center">
      <div className="w-full max-w-md mx-auto p-4 relative rounded-2xl ">
        {/* Button */}
        <button
          onClick={toggleOpen}
          className=" border px-4 py-2 rounded shadow-sm bg-white flex justify-between items-center hover:bg-gray-100"
        >
          <span>Add Filter</span>
          <ChevronDown size={12} />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-md z-10 p-4 space-y-3">
            {/* Step 1: Category */}
            <div>
              <p className="text-xs font-semibold mb-1">Select Category</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(filterCategories).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedSub(null);
                      setSelectedTags([]);
                      setMetricValue("");
                    }}
                    className={`px-3 py-1 border rounded-full text-xs ${
                      selectedCategory === cat
                        ? "bg-black text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 - Subcategory */}
            {selectedCategory && (
              <div>
                <p className="text-xs font-semibold mb-1">Select Sub Filter</p>
                <select
                  className="w-full px-3 py-2 border rounded text-sm"
                  value={selectedSub || ""}
                  onChange={(e) => {
                    setSelectedSub(e.target.value);
                    setSelectedTags([]);
                    setMetricValue("");
                  }}
                >
                  <option value="">-- Select --</option>
                  {filterCategories[selectedCategory].map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3 - Tag Multi-Select or Metric Input */}
            {selectedSub && (
              <>
                {/* For tag-based filters */}
                {selectedCategory !== "Metrics" && tagOptions[selectedSub] && (
                  <div>
                    <p className="text-xs font-semibold mb-1">Choose Value(s)</p>
                    <div className="flex flex-wrap gap-2">
                      {tagOptions[selectedSub].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 border rounded-full text-xs ${
                            selectedTags.includes(tag)
                              ? "bg-black text-white"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* For Metrics */}
                {selectedCategory === "Metrics" && (
                  <>
                    <div>
                      <p className="text-xs font-semibold mb-1">Condition</p>
                      <select
                        className="w-full px-3 py-2 border rounded text-sm"
                        value={selectedCondition}
                        onChange={(e) => setSelectedCondition(e.target.value)}
                      >
                        {conditions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <p className="text-xs font-semibold mb-1">Value</p>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border rounded text-sm"
                        placeholder="Enter value"
                        value={metricValue}
                        onChange={(e) => setMetricValue(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Apply Button */}
                <button
                  onClick={applyFilter}
                  className="w-full bg-black text-white text-sm py-2 rounded hover:bg-gray-800"
                >
                  Apply →
                </button>
              </>
            )}
          </div>
        )}

        {/* Applied Filters */}
        {filters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((f, i) => (
              <div
                key={i}
                className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
              >
                <span>
                  {f.category} > {f.sub} {f.condition} "{f.value}"
                </span>
                <button
                  onClick={() => removeFilter(i)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
