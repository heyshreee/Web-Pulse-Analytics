/**
 * Marketing illustrations.
 *
 * The artwork is authored as standalone animated SVG files in
 * `public/illustrations/` and rendered through a plain <img>. That keeps the
 * artwork out of the JS bundle, lets the browser cache and lazy-load it, and
 * guarantees none of its internal animation styles can reach the dashboard
 * surface (SVG-in-<img> is an isolated document).
 *
 * Wide, label-heavy pieces declare a `mobile` companion file: a stacked
 * variant drawn for narrow viewports so the labels stay legible instead of
 * being scaled down to a few pixels. The swap is a plain <picture> media
 * query, so only one of the two files is ever fetched.
 */
const ASSETS = {
  'hero-ecosystem': { width: 720, height: 720 },
  'tracker-flow': { width: 1200, height: 340, mobile: 'tracker-flow-mobile', mobileWidth: 440, mobileHeight: 780 },
  'insights-viz': { width: 780, height: 500, mobile: 'insights-viz-mobile', mobileWidth: 440, mobileHeight: 880 },
  'architecture-map': { width: 1200, height: 380, mobile: 'architecture-map-mobile', mobileWidth: 440, mobileHeight: 760 },
  'pipeline-mark': { width: 420, height: 120 },
};

/**
 * Below `lg` every section is a single column, so the desktop artwork would be
 * squeezed into a phone-width slot. Those viewports get the stacked variant,
 * capped at its natural size and centred.
 */
const STACKED_MAX = '(max-width: 1023px)';

export default function Illustration({
  name,
  alt,
  caption,
  variant = 'panel',
  priority = false,
  className = '',
}) {
  const asset = ASSETS[name];

  if (!asset) {
    // Fail loudly in development instead of rendering an empty <img>.
    throw new Error(`Unknown illustration "${name}". Add it to ASSETS first.`);
  }

  const classes = ['mkt-ill', variant === 'panel' ? 'mkt-ill-panel' : '', className]
    .filter(Boolean)
    .join(' ');

  const imgProps = {
    alt,
    width: asset.width,
    height: asset.height,
    className: 'mkt-ill-img',
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    fetchPriority: priority ? 'high' : 'auto',
    // Tells the stylesheet that this <img> swaps to a stacked variant so it can
    // pin the narrower aspect ratio and cap the width.
    'data-stacked': asset.mobile ? '' : undefined,
  };

  // Aspect ratios are pinned per breakpoint so swapping the <picture> source
  // never shifts the layout: the browser reserves the right height before the
  // file has even finished loading.
  const ratioStyle = {
    '--mkt-ill-ratio': `${asset.width} / ${asset.height}`,
    ...(asset.mobile
      ? { '--mkt-ill-ratio-mobile': `${asset.mobileWidth} / ${asset.mobileHeight}` }
      : null),
  };

  return (
    <figure className={classes} style={ratioStyle}>
      <picture>
        {asset.mobile ? (
          <source
            media={STACKED_MAX}
            srcSet={`/illustrations/${asset.mobile}.svg`}
            width={asset.mobileWidth}
            height={asset.mobileHeight}
          />
        ) : null}
        <img src={`/illustrations/${name}.svg`} {...imgProps} />
      </picture>
      {caption ? <figcaption className="mkt-ill-caption">{caption}</figcaption> : null}
    </figure>
  );
}
