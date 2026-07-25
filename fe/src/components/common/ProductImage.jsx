import { useEffect, useState } from 'react';

const PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dce5e0"/>
          <stop offset="100%" stop-color="#b8c9c0"/>
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#g)"/>
      <text x="400" y="410" text-anchor="middle" fill="#3a4a56" font-family="Arial,sans-serif" font-size="28">ShopVerse</text>
    </svg>`
  );

function ProductImage({ src, alt, className = '', ...props }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const imageSrc = !src || failed ? PLACEHOLDER : src;

  return (
    <img
      src={imageSrc}
      alt={alt || ''}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      {...props}
    />
  );
}

export default ProductImage;
