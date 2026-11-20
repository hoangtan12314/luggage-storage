"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Dial codes, Vietnam first (the default), then the nationalities the homestay sees most. */
const COUNTRIES: { iso: string; name: string; dial: string }[] = [
  { iso: "VN", name: "Vietnam", dial: "+84" },
  { iso: "US", name: "United States", dial: "+1" },
  { iso: "CA", name: "Canada", dial: "+1" },
  { iso: "GB", name: "United Kingdom", dial: "+44" },
  { iso: "AU", name: "Australia", dial: "+61" },
  { iso: "NZ", name: "New Zealand", dial: "+64" },
  { iso: "IE", name: "Ireland", dial: "+353" },
  { iso: "DE", name: "Germany", dial: "+49" },
  { iso: "FR", name: "France", dial: "+33" },
  { iso: "NL", name: "Netherlands", dial: "+31" },
  { iso: "BE", name: "Belgium", dial: "+32" },
  { iso: "CH", name: "Switzerland", dial: "+41" },
  { iso: "AT", name: "Austria", dial: "+43" },
  { iso: "IT", name: "Italy", dial: "+39" },
  { iso: "ES", name: "Spain", dial: "+34" },
  { iso: "PT", name: "Portugal", dial: "+351" },
  { iso: "SE", name: "Sweden", dial: "+46" },
  { iso: "NO", name: "Norway", dial: "+47" },
  { iso: "DK", name: "Denmark", dial: "+45" },
  { iso: "FI", name: "Finland", dial: "+358" },
  { iso: "PL", name: "Poland", dial: "+48" },
  { iso: "CZ", name: "Czechia", dial: "+420" },
  { iso: "RU", name: "Russia", dial: "+7" },
  { iso: "UA", name: "Ukraine", dial: "+380" },
  { iso: "TR", name: "Türkiye", dial: "+90" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso: "IN", name: "India", dial: "+91" },
  { iso: "CN", name: "China", dial: "+86" },
  { iso: "HK", name: "Hong Kong", dial: "+852" },
  { iso: "TW", name: "Taiwan", dial: "+886" },
  { iso: "JP", name: "Japan", dial: "+81" },
  { iso: "KR", name: "South Korea", dial: "+82" },
  { iso: "TH", name: "Thailand", dial: "+66" },
  { iso: "KH", name: "Cambodia", dial: "+855" },
  { iso: "LA", name: "Laos", dial: "+856" },
  { iso: "MY", name: "Malaysia", dial: "+60" },
  { iso: "SG", name: "Singapore", dial: "+65" },
  { iso: "ID", name: "Indonesia", dial: "+62" },
  { iso: "PH", name: "Philippines", dial: "+63" },
  { iso: "BR", name: "Brazil", dial: "+55" },
  { iso: "MX", name: "Mexico", dial: "+52" },
  { iso: "AR", name: "Argentina", dial: "+54" },
  { iso: "ZA", name: "South Africa", dial: "+27" },
];

const flag = (iso: string) =>
  String.fromCodePoint(...[...iso].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

type PhoneFieldProps = {
  id: string;
  /** Called with the full number ("+84 901234567"), or "" while the number box is empty. */
  onChange: (full: string) => void;
  onBlur?: () => void;
  label: string;
  autoComplete?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
};

/**
 * A country-code picker (native select — best on phones) beside the national
 * number. Emits one string, so the form and server keep validating plain "+CC number".
 * A leading 0 on the national number is dropped, and a number typed in full with
 * its own "+" is passed through untouched.
 */
export function PhoneField({
  id,
  onChange,
  onBlur,
  label,
  autoComplete,
  invalid,
  describedBy,
  className,
}: PhoneFieldProps) {
  const [iso, setIso] = useState("VN");
  const [national, setNational] = useState("");

  const emit = (nextIso: string, nextNational: string) => {
    const dial = COUNTRIES.find((c) => c.iso === nextIso)?.dial ?? "+84";
    const typed = nextNational.trim();
    if (!typed) return onChange("");
    onChange(typed.startsWith("+") ? typed : `${dial} ${typed.replace(/^0+/, "")}`);
  };

  return (
    <div className="mt-1.5 flex gap-2">
      <select
        aria-label={`${label} country code`}
        value={iso}
        onChange={(e) => {
          setIso(e.target.value);
          emit(e.target.value, national);
        }}
        onBlur={onBlur}
        className={cn(
          "border-cocoa/20 text-cocoa h-11 w-[7.5rem] shrink-0 rounded-xl border bg-white/80 px-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      >
        {COUNTRIES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {flag(c.iso)} {c.iso} {c.dial}
          </option>
        ))}
      </select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        value={national}
        onChange={(e) => {
          setNational(e.target.value);
          emit(iso, e.target.value);
        }}
        onBlur={onBlur}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="border-cocoa/20 text-cocoa h-11 min-w-0 flex-1 rounded-xl bg-white/80 px-3.5 text-base md:text-base"
      />
    </div>
  );
}
