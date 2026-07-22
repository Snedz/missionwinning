/**
 * Decorative marketing art with AVIF + WebP fallback (no next/image negotiation needed).
 */
type Props = {
  /** Base path without extension, e.g. /art/hero-field */
  base: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  fill?: boolean;
};

export function ArtPicture({
  base,
  alt = '',
  className,
  width,
  height,
  priority,
  fill,
}: Props) {
  const imgClass = fill
    ? `absolute inset-0 h-full w-full object-cover ${className ?? ''}`
    : className;
  return (
    <picture className={fill ? 'absolute inset-0 block' : undefined}>
      <source srcSet={`${base}.avif`} type="image/avif" />
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.webp`}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={imgClass}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
      />
    </picture>
  );
}
