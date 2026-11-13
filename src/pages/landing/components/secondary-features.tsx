import {
  IconFileText,
  IconMoodSmile,
  IconChartBar,
  IconUsers,
} from "@tabler/icons-react";
import type { ElementType } from "react";

interface FeatureItem {
  name: string;
  description: string;
  icon: ElementType;
}

const features: FeatureItem[] = [
  {
    name: "Cover images",
    description: "Add Unsplash photos to give each doc a visual identity at a glance.",
    icon: IconFileText,
  },
  {
    name: "Emoji icons",
    description: "Pick from 50 emojis to mark docs — no more guessing from titles alone.",
    icon: IconMoodSmile,
  },
  {
    name: "Analytics",
    description: "See docs created, cumulative words, and word count distribution over time.",
    icon: IconChartBar,
  },
  {
    name: "Team roles",
    description: "Admin, editor, and viewer roles keep the right people writing and reading.",
    icon: IconUsers,
  },
];

export function SecondaryFeatures() {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.name} className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{feature.name}</p>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
