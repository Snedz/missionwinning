import { cn } from '@/lib/utils';

type Props = {
  /**
   * Base path without extension, e.g. `/photo/rack-pull`. Omit to render the
   * placeholder — that is the expected state until real photography lands.
   */
  base?: string;
  alt?: string;
  /** Shown inside the placeholder so a slot says what belongs in it. */
  caption?: string;
  ratio?: '4:5' | '3:2' | '1:1';
  className?: string;
  priority?: boolean;
};

const RATIO_CLASS: Record<NonNullable<Props['ratio']>, string> = {
  '4:5': 'aspect-[4/5]',
  '3:2': 'aspect-[3/2]',
  '1:1': 'aspect-square',
};

/**
 * A photography slot, always grayscale.
 *
 * The handoff allows exactly one kind of image on this site: real documentary
 * photography, desaturated. No stock, no generated art — which is why this
 * renders a **placeholder** rather than a stand-in image when `base` is unset.
 * A neutral block is honest about being empty; an AI-generated gym photo would
 * not be, and would be far harder to notice and remove later.
 *
 * Dropping real photos in is a file swap: add `/public/photo/<name>.{avif,webp}`
 * and pass `base="/photo/<name>"`. The wrapper owns the ratio and the
 * desaturation, so layout does not move when the image arrives.
 */
export function GrayscalePhoto({
  base,
  alt = '',
  caption,
  ratio = '4:5',
  className,
  priority,
}: Props) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-neutral-200',
        RATIO_CLASS[ratio],
        className
      )}
    >
      {base ? (
        // contrast(1.08) with the desaturation — straight grayscale on paper
        // goes flat, and the handoff sheet's own `.grayscale` does the same.
        <picture className="absolute inset-0 block [filter:grayscale(1)_contrast(1.08)]">
          <source srcSet={`${base}.avif`} type="image/avif" />
          <source srcSet={`${base}.webp`} type="image/webp" />
          <img
            src={`${base}.webp`}
            alt={alt}
            className="h-full w-full object-cover"
            decoding={priority ? 'sync' : 'async'}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
          />
        </picture>
      ) : (
        <div
          className="absolute inset-0 flex items-end border-2 border-border p-4"
          aria-hidden
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {caption ?? 'Photography'}
          </span>
        </div>
      )}
    </div>
  );
}
