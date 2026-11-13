import { type ReactNode, type ElementType } from "react";
import {
  IconCloudUpload,
  IconLock,
  IconRefresh,
  IconFingerprint,
  IconSettings,
  IconDatabase,
} from "@tabler/icons-react";

interface FeatureItem {
  name: string;
  description: string;
  icon: ElementType;
}

interface Features03Props {
  eyebrow: string;
  heading: string;
  subtitle: string;
  screenshot?: ReactNode;
  features?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  {
    name: "Push to deploy.",
    description: "Commit your changes and watch them go live in seconds. No build steps, no waiting.",
    icon: IconCloudUpload,
  },
  {
    name: "SSL certificates.",
    description: "Every deployment gets HTTPS by default. Zero configuration, always encrypted.",
    icon: IconLock,
  },
  {
    name: "Simple queues.",
    description: "Process background jobs reliably without managing infrastructure.",
    icon: IconRefresh,
  },
  {
    name: "Advanced security.",
    description: "Role-based access, audit logs, and SSO built into every plan.",
    icon: IconFingerprint,
  },
  {
    name: "Powerful API.",
    description: "RESTful endpoints for everything. Automate your entire workflow programmatically.",
    icon: IconSettings,
  },
  {
    name: "Database backups.",
    description: "Automatic daily snapshots with one-click restore. Never lose a byte.",
    icon: IconDatabase,
  },
];

export function Features03({
  eyebrow,
  heading,
  subtitle,
  screenshot,
  features = defaultFeatures,
}: Features03Props) {
  return (
    <section className="landing py-24">
      {/* Header */}
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">{eyebrow}</p>
          <h2 className="mt-2 text-balance">{heading}</h2>
          <p className="mt-6 text-pretty text-lg text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Screenshot */}
      {screenshot && (
        <div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-page px-6 lg:px-8">
            <div className="mb-[-12%] overflow-hidden rounded-xl shadow-2xl ring-1 ring-border">
              {screenshot}
            </div>
            <div aria-hidden="true" className="relative">
              <div className="absolute -inset-x-20 bottom-0 bg-gradient-to-t from-background pt-[7%]" />
            </div>
          </div>
        </div>
      )}

      {/* Feature grid */}
      <div className="mx-auto mt-16 max-w-page px-6 sm:mt-20 md:mt-24 lg:px-8">
        <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-sm text-muted-foreground sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-9">
              <dt className="inline font-semibold text-foreground">
                <feature.icon
                  aria-hidden="true"
                  className="absolute top-1 left-1 size-4 text-primary"
                />
                {feature.name}
              </dt>{" "}
              <dd className="inline">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
