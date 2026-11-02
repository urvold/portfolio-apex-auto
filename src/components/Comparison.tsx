import { useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import { ChevronsLeftRight, MoveHorizontal } from 'lucide-react';
import { Label, img, responsive } from './ui';

/** One React value drives ARIA, the clip and handle. No position transition. */
export function Comparison() {
  const [value, setValue] = useState(52);
  const dragging = useRef<number | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  const change = (next: number) => setValue(Math.max(0, Math.min(100, next)));
  function position(clientX: number) {
    const rect = surface.current?.getBoundingClientRect();
    if (rect && rect.width > 0) change(((clientX - rect.left) / rect.width) * 100);
  }
  function down(e: PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    dragging.current = e.pointerId;
    if (typeof e.currentTarget.setPointerCapture === 'function') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    e.currentTarget.focus({ preventScroll: true });
    position(e.clientX);
  }
  function end(e: PointerEvent<HTMLDivElement>) {
    if (dragging.current !== e.pointerId) return;
    dragging.current = null;
    if (
      typeof e.currentTarget.hasPointerCapture === 'function' &&
      e.currentTarget.hasPointerCapture(e.pointerId) &&
      typeof e.currentTarget.releasePointerCapture === 'function'
    ) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }
  function key(e: KeyboardEvent) {
    const step = e.shiftKey ? 10 : 1;
    const delta: Record<string, number> = {
      ArrowLeft: -step,
      ArrowDown: -step,
      ArrowRight: step,
      ArrowUp: step,
      PageDown: -10,
      PageUp: 10,
    };
    if (e.key === 'Home') {
      e.preventDefault();
      change(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      change(100);
    } else if (e.key in delta) {
      e.preventDefault();
      change(value + delta[e.key]);
    }
  }
  return (
    <section className="section compare-section" aria-labelledby="compare-title">
      <div className="section-heading">
        <div>
          <Label>04 / УВИДЕТЬ РАЗНИЦУ</Label>
          <h2 id="compare-title">
            Свет меняет всё.
            <br />
            <em>Точность — тоже.</em>
          </h2>
        </div>
        <p id="compare-help">
          Потяните разделитель в любую сторону.
          <br />
          Один кадр, цифровая симуляция —<br />
          не реальный результат ремонта.
        </p>
      </div>
      <div
        ref={surface}
        className="comparison"
        role="slider"
        aria-label="Сравнение изображения до и после цифровой обработки"
        aria-describedby="compare-help"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        aria-valuetext={`Зона «До»: ${Math.round(value)} процентов`}
        aria-orientation="horizontal"
        tabIndex={0}
        onDragStart={(e) => e.preventDefault()}
        onPointerDown={down}
        onPointerMove={(e) => {
          if (dragging.current === e.pointerId) position(e.clientX);
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={(e) => {
          if (dragging.current === e.pointerId) dragging.current = null;
        }}
        onKeyDown={key}
      >
        <img
          src={img('black')}
          {...responsive('black')}
          alt="Графитовый автомобиль: исходный кадр"
          loading="lazy"
          draggable={false}
        />
        <div className="before-image" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <img
            src={img('black')}
            {...responsive('black')}
            alt="Тот же кадр с цифровой симуляцией приглушённого покрытия"
            loading="lazy"
            draggable={false}
          />
        </div>
        <span className="compare-tag before">
          ДО <span>/ СИМУЛЯЦИЯ</span>
        </span>
        <span className="compare-tag after">
          ПОСЛЕ <span>/ СИМУЛЯЦИЯ</span>
        </span>
        <div className="compare-line" style={{ left: `${value}%` }} aria-hidden="true">
          <span>
            <ChevronsLeftRight size={24} />
          </span>
        </div>
      </div>
      <div className="comparison-caption">
        <span>
          <MoveHorizontal size={19} /> Потяните пальцем или мышью
        </span>
        <span>Клавиатура: стрелки ← →</span>
      </div>
    </section>
  );
}
