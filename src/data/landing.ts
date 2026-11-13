import type { Logo } from "@/pages/landing/components/partner-logo-grid";

export const heroWords = [
  "Documents",
  "Wikis",
  "Notes",
  "Plans",
  "Specs",
  "Reports",
];


export const partnerLogos: Logo[] = [
  { key: "vercel", src: "/logos/vercel.svg", alt: "Vercel" },
  { key: "stripe", src: "/logos/stripe.svg", alt: "Stripe" },
  { key: "supabase", src: "/logos/supabase.svg", alt: "Supabase" },
  { key: "cursor", src: "/logos/cursor.svg", alt: "Cursor" },
  { key: "raycast", src: "/logos/raycast.svg", alt: "Raycast" },
  { key: "posthog", src: "/logos/posthog.svg", alt: "PostHog" },
  { key: "webflow", src: "/logos/webflow.svg", alt: "Webflow" },
  { key: "resend", src: "/logos/resend.svg", alt: "Resend" },
  { key: "clerk", src: "/logos/clerk.svg", alt: "Clerk" },
  { key: "asana", src: "/logos/asana.svg", alt: "Asana" },
  { key: "slack", src: "/logos/slack.svg", alt: "Slack" },
  { key: "sanity", src: "/logos/sanity.svg", alt: "Sanity" },
  { key: "shopify", src: "/logos/shopify.svg", alt: "Shopify" },
  { key: "replit", src: "/logos/replit.svg", alt: "Replit" },
];

export interface QuoteTestimonial {
  quote: string;
  title: string;
  company: string;
  backgroundImage: string;
  variant: "light" | "dark";
}

export const quoteTestimonials: QuoteTestimonial[] = [
  {
    quote: "A compliance report that used to take our legal team an entire week now gets drafted in under 4 hours. The accuracy is remarkable.",
    title: "General Counsel",
    company: "Global financial services firm",
    backgroundImage: "https://images.pexels.com/photos/1078850/pexels-photo-1078850.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "Our team tried to turn it off for a week as a test. By Wednesday, people were filing support tickets to get it back.",
    title: "VP of Engineering",
    company: "Series B fintech startup",
    backgroundImage: "https://images.pexels.com/photos/572897/pexels-photo-572897.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "Sales cycles shortened by 30% because reps walk into every call with deep account context they never had time to assemble before.",
    title: "Chief Revenue Officer",
    company: "Enterprise SaaS company",
    backgroundImage: "https://images.pexels.com/photos/443446/pexels-photo-443446.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "We replaced 6 disconnected internal tools with one surface. Onboarding new analysts went from 3 weeks to 3 days.",
    title: "Head of Operations",
    company: "Management consulting firm",
    backgroundImage: "https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "The thing that sold us was governance. We choose exactly which data sources it can access and audit every interaction.",
    title: "Chief Information Security Officer",
    company: "Healthcare technology provider",
    backgroundImage: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "People who never touched automation before are building their own workflows. It lowered the bar without lowering the ceiling.",
    title: "Director of Digital Transformation",
    company: "Commercial real estate group",
    backgroundImage: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "Portfolio monitoring that took a full analyst day now runs continuously. We catch signals we were completely missing before.",
    title: "Managing Partner",
    company: "Growth equity firm",
    backgroundImage: "https://images.pexels.com/photos/462162/pexels-photo-462162.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
  {
    quote: "I asked it for the action items from last Thursday's board meeting and had them in Slack in 12 seconds. That changed everything.",
    title: "Chief Technology Officer",
    company: "Logistics platform startup",
    backgroundImage: "https://images.pexels.com/photos/33109/pexels-photo-33109.jpeg?auto=compress&cs=tinysrgb&w=1200",
    variant: "light",
  },
];

export interface Testimonial {
  name: string;
  initials: string;
  avatar?: string;
  title: string;
  company: string;
  quote: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah Chen",
    initials: "SC",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "VP Engineering",
    company: "Acme",
    quote: "This tool transformed how our team collaborates. We shipped 3x faster in the first quarter.",
  },
  {
    name: "Marcus Rivera",
    initials: "MR",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Product Lead",
    company: "Globex",
    quote: "The AI features feel like magic. It handles the repetitive work so we can focus on strategy.",
  },
  {
    name: "Emma Johansson",
    initials: "EJ",
    avatar: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "CTO",
    company: "Initech",
    quote: "We evaluated 6 tools before choosing this one. The integration was seamless.",
  },
  {
    name: "David Kim",
    initials: "DK",
    avatar: "https://images.pexels.com/photos/845434/pexels-photo-845434.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Head of Ops",
    company: "Umbrella",
    quote: "Our operational costs dropped 40% in the first month. The ROI speaks for itself.",
  },
  {
    name: "Aisha Patel",
    initials: "AP",
    avatar: "https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=400",
    title: "Director of Growth",
    company: "Stark Industries",
    quote: "The analytics dashboard alone was worth the investment. Finally, data we can act on.",
  },
];

export interface QuoteSlideData {
  quote: string;
  author: string;
  title: string;
  company: string;
  imageUrl?: string;
  rotation?: number;
}

export const quoteSlides: QuoteSlideData[] = [
  {
    quote: "This tool transformed how our team collaborates. We shipped 3x faster in the first quarter.",
    author: "Sarah Chen",
    title: "VP Engineering",
    company: "Acme",
    imageUrl: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rotation: -3,
  },
  {
    quote: "The AI features feel like magic. It handles the repetitive work so we can focus on strategy.",
    author: "Marcus Rivera",
    title: "Product Lead",
    company: "Globex",
    imageUrl: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rotation: 2,
  },
  {
    quote: "We evaluated 6 tools before choosing this one. The integration was seamless.",
    author: "Emma Johansson",
    title: "CTO",
    company: "Initech",
    imageUrl: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rotation: -2,
  },
  {
    quote: "Our operational costs dropped 40% in the first month. The ROI speaks for itself.",
    author: "David Kim",
    title: "Head of Ops",
    company: "Umbrella",
    imageUrl: "https://images.pexels.com/photos/845434/pexels-photo-845434.jpeg?auto=compress&cs=tinysrgb&w=1200",
    rotation: 3,
  },
];
