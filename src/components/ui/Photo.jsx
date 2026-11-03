import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { assetUrl } from '../../lib/api';

// An image that sits on a tone step until it loads, then fades in.
export function Photo({ src, alt, className = '', imgClassName = '', fit = 'cover', eager, ...props }) {
  const [state, setState] = useState(src ? 'loading' : 'error');
  return (
    <div className={`relative overflow-hidden bg-surface ${className}`}>
      {state !== 'error' && (
        <img
          src={assetUrl(src)}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('error')}
          className={`h-full w-full transition-[opacity,transform] duration-700 ease-out ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${state === 'ready' ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          {...props}
        />
      )}
      {state === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center text-muted">
          <ImageOff size={24} strokeWidth={1.5} aria-hidden="true" />
          <span className="sr-only">{alt}</span>
        </div>
      )}
    </div>
  );
}
