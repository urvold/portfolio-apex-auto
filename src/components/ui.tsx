import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { assetUrl } from '../paths';
import { imageWidths } from '../data/imageWidths';
export const img = (name: string) => assetUrl(`images/${name}.webp`);
export function responsive(name: string, sizes = '(max-width: 767px) 100vw, 60vw') {
  const widths = imageWidths[name] || { small: 760, large: 1600 };
  return {
    srcSet: `${assetUrl(`images/${name}-small.webp`)} ${widths.small}w, ${img(name)} ${widths.large}w`,
    sizes,
  };
}
export const Arrow = () => <ArrowUpRight size={21} aria-hidden="true" />;
export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </div>
  );
}
export function Button({
  to,
  children,
  light = false,
}: {
  to: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`button ${light ? 'outline' : ''}`} to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
