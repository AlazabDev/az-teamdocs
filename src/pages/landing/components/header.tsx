import { Button } from "@/components/base/button";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

function Logo() {
  return (
    <a href="/" className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground">
      Acme
    </a>
  );
}

function NavItems({ links }: { links: NavLink[] }) {
  return (
    <>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {link.label}
        </a>
      ))}
    </>
  );
}

/**
 * Header01 — Logo + nav left, actions right.
 */
export function Header01() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 lg:flex">
            <NavItems links={navLinks} />
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost">Sign in</Button>
          <Button>View demo</Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Header02 — Logo left, nav centre, actions right.
 */
export function Header02() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex">
          <NavItems links={navLinks} />
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost">Sign in</Button>
          <Button>View demo</Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Header03 — Logo left, all links (text only) right.
 */
export function Header03() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex">
          <NavItems links={navLinks} />
          <a
            href="#"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </a>
          <a
            href="#"
            className="text-sm text-foreground transition-colors hover:text-foreground"
          >
            View demo
          </a>
        </nav>
      </div>
    </header>
  );
}
