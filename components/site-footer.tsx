import { LOCATION } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t">
      <div className="text-muted-foreground mx-auto max-w-5xl px-6 py-8 text-sm">
        <p className="text-foreground font-medium">{LOCATION.name}</p>
        <p>{LOCATION.address}</p>
        <p>
          {LOCATION.hours} · {LOCATION.phone}
        </p>
      </div>
    </footer>
  );
}
