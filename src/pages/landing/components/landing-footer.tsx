export function LandingFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-page items-center justify-between px-6 lg:px-8">
        <a
          href="/"
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          Team Docs
        </a>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Team Docs
        </p>
      </div>
    </footer>
  );
}
