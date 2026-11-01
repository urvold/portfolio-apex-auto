import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X, ArrowUpRight } from 'lucide-react';
import { projects, services } from '../data';
import { Arrow, Label, img, responsive } from './ui';

export function Gallery({ full = false }: { full?: boolean }) {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const list = projects.filter((p) => filter === 'all' || p.type === filter);
  const selected = active === null ? null : list[active];
  function close() {
    setActive(null);
  }
  function move(delta: number) {
    setActive((index) => (index === null ? null : (index + delta + list.length) % list.length));
  }
  useEffect(() => {
    if (active !== null) {
      dialog.current?.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
    dialog.current?.close();
  }, [active]);
  useEffect(() => {
    if (active !== null && list.length > 1) {
      const image = new Image();
      image.src = img(list[(active + 1) % list.length].image);
    }
  }, [active, filter]);
  return (
    <section
      className={`section gallery ${full ? 'gallery-full' : ''}`}
      aria-labelledby="gallery-title"
    >
      {full ? (
        <div className="gallery-compact-heading">
          <h2 id="gallery-title" className="sr-only">
            Архив демонстрационных проектов
          </h2>
          <Label>{String(projects.length).padStart(2, '0')} / ДЕМОНСТРАЦИОННЫХ ИСТОРИЙ</Label>
          <p>Иллюстративная съёмка и реальные процессы ухода.</p>
        </div>
      ) : (
        <div className="section-heading">
          <div>
            <Label>03 / ВИЗУАЛЬНЫЙ АРХИВ</Label>
            <h2 id="gallery-title">
              У каждого автомобиля
              <br />
              <em>своя история.</em>
            </h2>
          </div>
          <p>
            Форма. Фактура. Внимание.
            <br />
            Демонстрационные проекты и иллюстрации технологий.
          </p>
        </div>
      )}
      <div className="gallery-filter-row">
        <div className="filters" role="group" aria-label="Фильтр проектов">
          {[
            ['all', 'Все проекты'],
            ['polishing', 'Полировка'],
            ['film', 'Защита'],
            ['interior', 'Интерьер'],
            ['painting', 'Окраска'],
            ['coatings', 'Покрытия'],
            ['bodywork', 'Мастерская'],
          ].map(([id, title]) => (
            <button
              key={id}
              aria-pressed={id === filter}
              className={id === filter ? 'active' : ''}
              onClick={() => {
                setFilter(id);
                setActive(null);
              }}
            >
              {title}{' '}
              <span>
                {id === 'all' ? projects.length : projects.filter((p) => p.type === id).length}
              </span>
            </button>
          ))}
        </div>
        <span className="gallery-count" role="status" aria-live="polite">
          {String(list.length).padStart(2, '0')} / В АРХИВЕ
        </span>
      </div>
      <div className="project-grid" key={filter}>
        {list.slice(0, full ? list.length : 3).map((p, i) => (
          <button
            className="project-card"
            data-image={p.image}
            key={p.title}
            onClick={() => setActive(i)}
          >
            <div className="project-image">
              <img
                loading="lazy"
                src={img(p.image)}
                {...responsive(
                  p.image,
                  i === 0 || (full && i === 3)
                    ? '(max-width: 600px) 100vw, 90vw'
                    : '(max-width: 600px) 100vw, 45vw',
                )}
                alt=""
              />
              <span className="project-badge">
                ДЕМО / {String(projects.indexOf(p) + 1).padStart(2, '0')}
              </span>
              <span className="project-open">
                <Plus size={23} />
              </span>
            </div>
            <div className="project-title">
              <div>
                <span className="project-category">
                  {services.find((s) => s.slug === p.type)?.title}
                </span>
                <h3>{p.title}</h3>
                <p>{p.car}</p>
              </div>
              <Arrow />
            </div>
          </button>
        ))}
      </div>
      {!full && (
        <div className="section-end">
          <span>Иллюстративная съёмка. Вымышленный бренд.</span>
          <Link className="text-link" to="/projects">
            Весь архив / {String(projects.length).padStart(2, '0')} <Arrow />
          </Link>
        </div>
      )}
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Просмотр демонстрационного проекта"
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            move(1);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            move(-1);
          }
        }}
      >
        {selected && (
          <>
            <div className="lightbox-top">
              <span>
                APEX / VISUAL ARCHIVE{' '}
                <b>
                  {String((active ?? 0) + 1).padStart(2, '0')} —{' '}
                  {String(list.length).padStart(2, '0')}
                </b>
              </span>
              <button className="close-modal" onClick={close} aria-label="Закрыть просмотр">
                <X size={24} />
              </button>
            </div>
            <div
              className="lightbox-media"
              onPointerDown={(e) => {
                swipe.current = { x: e.clientX, y: e.clientY };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerUp={(e) => {
                if (swipe.current) {
                  const dx = e.clientX - swipe.current.x;
                  const dy = e.clientY - swipe.current.y;
                  if (Math.abs(dx) > 55 && Math.abs(dy) < 75) move(dx < 0 ? 1 : -1);
                }
                swipe.current = null;
              }}
              onPointerCancel={() => {
                swipe.current = null;
              }}
            >
              <img
                key={selected.image}
                src={img(selected.image)}
                alt={selected.car}
                draggable={false}
              />
            </div>
            <div className="lightbox-bottom">
              <div className="lightbox-navigation">
                <button
                  onClick={() => move(-1)}
                  disabled={list.length < 2}
                  aria-label="Предыдущий проект"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => move(1)}
                  disabled={list.length < 2}
                  aria-label="Следующий проект"
                >
                  <ChevronRight />
                </button>
              </div>
              <div className="lightbox-copy">
                <span className="small-index">ДЕМОНСТРАЦИОННЫЙ ПРОЕКТ</span>
                <h3>{selected.title}</h3>
                <p>{selected.text}</p>
              </div>
              <Link className="text-link" onClick={close} to={`/services/${selected.type}`}>
                О направлении <ArrowUpRight size={21} />
              </Link>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
