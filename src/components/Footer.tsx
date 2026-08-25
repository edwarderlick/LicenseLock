import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-outline/20 bg-surface-container-lowest py-8">
      <div className="max-w-container-max mx-auto px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-label-caps text-label-caps text-on-surface-variant">© 2024 LicenseLock. Verified on GenLayer.</p>
        <Link className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary-fixed transition-colors underline decoration-outline/30" href="#">
          GenLayer Studio
        </Link>
      </div>
    </footer>
  );
}
