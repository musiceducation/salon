import { publicAssetPath } from "@/lib/public-asset-path";

type Frame = {
  src: string;
  width: number;
  height: number;
  media: string;
};

type Props = {
  mobile: Frame;
  desktop: Frame;
  className?: string;
  /** Hero only. Preloads the matching breakpoint and marks the photo eager. */
  priority?: boolean;
  alt?: string;
};

/**
 * Full-bleed photo with a mobile and desktop file.
 * Sources are already WebP at the rendered size, so this stays a static request
 * (the `/_next/image` hop was skipping paint in Safari and adds a redirect before LCP).
 */
export function ArtDirectedPhoto({ mobile, desktop, className, priority = false, alt = "" }: Props) {
  const mobileSrc = publicAssetPath(mobile.src);
  const desktopSrc = publicAssetPath(desktop.src);

  return (
    <>
      {priority ? (
        <>
          <link rel="preload" as="image" href={mobileSrc} media={mobile.media} fetchPriority="high" />
          <link rel="preload" as="image" href={desktopSrc} media={desktop.media} fetchPriority="high" />
        </>
      ) : null}
      <picture>
        <source media={mobile.media} srcSet={mobileSrc} type="image/webp" width={mobile.width} height={mobile.height} />
        {/* Pre-sized WebP. A plain img is the art-direction element inside picture. */}
        <img
          src={desktopSrc}
          alt={alt}
          width={desktop.width}
          height={desktop.height}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          className={className}
        />
      </picture>
    </>
  );
}
