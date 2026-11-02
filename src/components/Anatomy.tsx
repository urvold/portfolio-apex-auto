import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ScanLine, Sun } from 'lucide-react';
import { anatomyAreas } from '../data/anatomy';
import { services, calculatorOptions } from '../data';
import { img, responsive, Label } from './ui';

export function Anatomy() {
  const [active, setActive] = useState(0);
  const [photo, setPhoto] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const area = anatomyAreas[active];
  const service = services.find((s) => s.slug === area.service)!;
  const wheelsPrice = calculatorOptions.find((option) => option[0] === 'wheels')![2];
  function navigate(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % anatomyAreas.length;
    else if (event.key === 'ArrowLeft')
      next = (index + anatomyAreas.length - 1) % anatomyAreas.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = anatomyAreas.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }
  return (
    <section id="anatomy" className="section anatomy" aria-labelledby="anatomy-title">
      <div className="section-heading">
        <div>
          <Label>01 / ИНТЕРАКТИВНАЯ ЭКСПЕРТИЗА</Label>
          <h2 id="anatomy-title">
            Анатомия
            <br />
            <em>совершенства.</em>
          </h2>
        </div>
        <p>
          Один автомобиль. Шесть точек внимания.
          <br />
          Выберите область — откройте подход APEX.
        </p>
      </div>
      <div className="anatomy-product">
        <div className="anatomy-visual">
          <div className="anatomy-toolbar">
            <span>APEX / ИНТЕРАКТИВНЫЙ ОБЗОР</span>
            <button onClick={() => setPhoto(!photo)} aria-pressed={photo}>
              {photo ? <ScanLine size={17} /> : <Sun size={17} />}
              {photo ? 'Контур' : 'Фотография'}
            </button>
          </div>
          <div className={`anatomy-stage ${photo ? 'photo-mode' : ''}`}>
            <img
              className="anatomy-car"
              src={img('white')}
              {...responsive('white')}
              alt="Профиль синего спортивного купе с интерактивными областями"
              loading="lazy"
            />
            <div className="anatomy-grid" aria-hidden="true" />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="anatomy-lines"
              aria-hidden="true"
            >
              {anatomyAreas.map((v, i) => (
                <g key={v.id} className={i === active ? 'selected' : ''}>
                  <path
                    d={`M ${v.x} ${v.y} V ${(v.y + v.target[1]) / 2} L ${v.target[0]} ${v.target[1]}`}
                  />
                  <circle cx={v.target[0]} cy={v.target[1]} r=".8" />
                </g>
              ))}
            </svg>
            {anatomyAreas.map((v, i) => (
              <button
                key={v.id}
                className={`anatomy-point ${active === i ? 'active' : ''}`}
                style={{ left: `${v.x}%`, top: `${v.y}%` }}
                aria-label={`0${i + 1} ${v.title} — исследовать область`}
                aria-pressed={active === i}
                aria-controls="anatomy-panel"
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                <span className="point-label">{v.title}</span>
              </button>
            ))}
          </div>
          <div className="anatomy-tabs" role="tablist" aria-label="Области автомобиля">
            {anatomyAreas.map((v, i) => (
              <button
                key={v.id}
                id={`anatomy-tab-${i}`}
                role="tab"
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                tabIndex={active === i ? 0 : -1}
                aria-selected={active === i}
                aria-controls="anatomy-panel"
                onKeyDown={(e) => navigate(e, i)}
                onClick={() => setActive(i)}
              >
                <span>0{i + 1}</span>
                {v.title}
              </button>
            ))}
          </div>
        </div>
        <div
          id="anatomy-panel"
          className="anatomy-panel"
          role="tabpanel"
          aria-labelledby={`anatomy-tab-${active}`}
          tabIndex={0}
        >
          <div className="anatomy-panel-content" key={area.id}>
            <div className="anatomy-panel-image" data-area={area.id}>
              <img
                src={img(area.image)}
                {...responsive(
                  area.image,
                  '(max-width: 600px) 100vw, (max-width: 900px) 50vw, 38vw',
                )}
                loading="lazy"
                alt={`Иллюстрация направления: ${area.title}`}
              />
              <span>0{active + 1} / 06</span>
            </div>
            <div className="anatomy-panel-copy">
              <span className="small-index">{area.detail}</span>
              <h3>{area.headline}</h3>
              <p>{area.text}</p>
              <div className="anatomy-context">
                <span>
                  {area.id === 'wheels' ? 'Демо-опция' : 'Демо-ориентир'}
                  <strong>
                    {area.id === 'wheels' ? '+' : 'от '}
                    {(area.id === 'wheels' ? wheelsPrice : service.price).toLocaleString('ru-RU')} ₽
                  </strong>
                </span>
                <span>
                  {area.id === 'wheels' ? 'Формат' : 'Ориентир по срокам'}
                  <strong>{area.id === 'wheels' ? 'К услуге ухода' : service.time}</strong>
                </span>
              </div>
              <Link className="text-link" to={`/services/${area.service}`}>
                Подробнее о направлении <ArrowUpRight size={21} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="anatomy-footnote">
        <span>ВЫБЕРИТЕ ТОЧКУ НА АВТОМОБИЛЕ ИЛИ НАПРАВЛЕНИЕ ВНИЗУ</span>
        <span>Визуальная карта услуг / демонстрация</span>
      </div>
    </section>
  );
}
