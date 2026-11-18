import Image from "next/image";

/**
 * The hero photo block shared by the landing and classes pages.
 *
 * Below lg the photo starts under the floating header (top-[4.5rem]) so the
 * logo tile and menu button never cover the face, and fades into the cream
 * page at both ends. From lg up it fills its grid column and its right edge
 * gets the large organic curve from the design.
 */
export function HeroPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-[27rem] overflow-hidden sm:h-[30rem] lg:h-[30rem] lg:[border-radius:0_17%_31%_0/0_44%_56%_0]">
      <div className="absolute inset-x-0 top-[4.5rem] bottom-0 lg:inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover object-[35%_30%]"
        />
        <div
          aria-hidden
          className="from-cream absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent lg:hidden"
        />
      </div>
      <div
        aria-hidden
        className="via-cream/70 to-cream absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent lg:hidden"
      />
    </div>
  );
}
