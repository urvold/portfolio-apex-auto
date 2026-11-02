import { useEffect, useRef } from 'react';
import { ArrowDownRight } from 'lucide-react';
import { assetUrl } from '../paths';
import { Button, Label, img } from './ui';

export function Hero() {
  const hero = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const node = hero.current;
      if (!node) return;
      const top = node.getBoundingClientRect().top;
      node.style.setProperty(
        '--hero-shift',
        media.matches ? '0px' : `${Math.max(0, Math.min(-top * 0.13, 90))}px`,
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', scroll, { passive: true });
    media.addEventListener('change', update);
    return () => {
      window.removeEventListener('scroll', scroll);
      media.removeEventListener('change', update);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <section className="hero" ref={hero} aria-labelledby="hero-title">
      <div className="hero-image">
        <img
          src={img('hero')}
          srcSet={`${assetUrl('images/hero-mobile.webp')} 850w, ${img('hero')} 1800w`}
          sizes="100vw"
          width="1800"
          height="1125"
          fetchPriority="high"
          alt="Светлое спортивное купе в тёмном пространстве"
        />
      </div>
      <div className="hero-shade" />
      <div className="hero-grid" aria-hidden="true">
        <span>01 — ФОРМА</span>
        <span>02 — ПОКРЫТИЕ</span>
        <span>03 — ОЩУЩЕНИЯ</span>
      </div>
      <div className="hero-content">
        <Label>APEX AUTO / ИСКУССТВО АВТОМОБИЛЬНОЙ ЭСТЕТИКИ</Label>
        <h1 id="hero-title">
          СОВЕРШЕНСТВО
          <br />
          <span>В КАЖДОЙ</span>
          <br className="mobile-break" />{' '}
          <i>
            ДЕТАЛИ<span className="red-dot">.</span>
          </i>
        </h1>
        <div className="hero-bottom">
          <p>
            Кузовной ремонт, детейлинг и защита.
            <br /> Точность, которую видно. Качество, которое ощущается.
          </p>
          <div className="hero-actions">
            <Button to="/services">Найти свою услугу</Button>
            <Button to="/contacts" light>
              Обсудить автомобиль
            </Button>
          </div>
        </div>
      </div>
      <div className="hero-caption">
        <span>КОНЦЕПТ / ДЕМОНСТРАЦИОННЫЙ ПРОЕКТ</span>
        <a href="#anatomy">
          Исследовать автомобиль <ArrowDownRight size={20} />
        </a>
      </div>
      <div className="hero-stamp" aria-hidden="true">
        A
        <span>
          ТОЧНОСТЬ
          <br />В КАЖДОЙ ЛИНИИ
        </span>
      </div>
    </section>
  );
}
