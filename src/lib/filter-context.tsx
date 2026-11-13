import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type DateRangePreset = "7d" | "30d" | "90d" | "all";

interface FilterState {
  dateRangePreset: DateRangePreset;
  startDate: string;
  endDate: string;
}

interface FilterContextValue {
  filters: FilterState;
  setDateRangePreset: (preset: DateRangePreset) => void;
}

function presetToDates(preset: DateRangePreset): { startDate: string; endDate: string } {
  const now = new Date();
  const end = now.toISOString();

  if (preset === "all") {
    return { startDate: "1970-01-01T00:00:00Z", endDate: end };
  }

  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return { startDate: start.toISOString(), endDate: end };
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [dateRangePreset, setPreset] = useState<DateRangePreset>("30d");

  const { startDate, endDate } = presetToDates(dateRangePreset);

  const setDateRangePreset = useCallback((preset: DateRangePreset) => {
    setPreset(preset);
  }, []);

  return (
    <FilterContext.Provider
      value={{
        filters: { dateRangePreset, startDate, endDate },
        setDateRangePreset,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be inside FilterProvider");
  return ctx;
}
