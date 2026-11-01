import React, { useEffect, useRef, useState } from 'react';

import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Menu, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { services, projects, faq } from './data';
import { assetUrl, pagePath } from './paths';

const img = (name: string) => assetUrl(`images/${name}.webp`);
function responsive(name: string) {
  return {
    srcSet: `${assetUrl(`images/${name}-small.webp`)} 800w, ${assetUrl(`images/${name}.webp`)} 1800w`,
    sizes: '(max-width: 767px) 100vw, 60vw',
  };
}
const Arrow = () => <ArrowUpRight size={19} aria-hidden="true" />;
function Button({
  to,
  children,
  light = false,
}: {
  to: string;
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <Link className={`button ${light ? 'outline' : ''}`} to={to}>
      {children}
      <Arrow />
    </Link>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', escape);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', escape);
      document.body.style.overflow = '';
    };
  }, [open]);
  return (
    <header>
      <Link to="/" className="logo">
        APEX<span>AUTO / ESTHETICS</span>
      </Link>
      <nav aria-label="Основная навигация" className={open ? 'open' : ''}>
        {[
          ['/services', 'Услуги'],
          ['/projects', 'Проекты'],
          ['/about', 'О компании'],
          ['/contacts', 'Контакты'],
        ].map(([url, name]) => (
          <Link aria-current={loc.pathname.startsWith(url) ? 'page' : undefined} key={url} to={url}>
            {name}
          </Link>
        ))}
        <Link className="nav-cta" to="/contacts">
          Обсудить автомобиль <Arrow />
        </Link>
      </nav>
      <button
        className="menu-toggle"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <Link className="footer-logo" to="/">
          APEX AUTO<span>ИСКУССТВО АВТОМОБИЛЬНОЙ ЭСТЕТИКИ</span>
        </Link>
        <div>
          <Link to="/services">Услуги</Link>
          <Link to="/projects">Проекты</Link>
          <Link to="/about">О компании</Link>
          <Link to="/contacts">Контакты</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 APEX AUTO</span>
        <span>Концепт / демонстрационный проект</span>
        <span>Вымышленный бренд. Данные не собираются.</span>
      </div>
    </footer>
  );
}
function Hero() {
  return (
    <section className="hero">
      <img
        src={img('hero')}
        {...responsive('hero')}
        alt="Светлое спортивное купе в тёмном выставочном пространстве"
        fetchPriority="high"
        srcSet={`${assetUrl('images/hero-mobile.webp')} 850w, ${assetUrl('images/hero.webp')} 1800w`}
        sizes="100vw"
      />
      <div className="hero-shade" />
      <div className="hero-content">
        <Label>АВТОМОБИЛЬНАЯ ЭСТЕТИКА БЕЗ КОМПРОМИССОВ</Label>
        <h1>
          СОВЕРШЕНСТВО
          <br />В КАЖДОЙ <i>ДЕТАЛИ</i>
          <span className="red-dot">.</span>
        </h1>
        <div className="hero-bottom">
          <p>Кузовной ремонт, детейлинг и защита автомобиля с вниманием к каждой линии.</p>
          <div className="actions">
            <Button to="/services">Наши услуги</Button>
            <Button to="/contacts" light>
              Обсудить автомобиль
            </Button>
          </div>
        </div>
      </div>
      <div className="hero-caption">
        <span>01 / ТОЧНОСТЬ. ФОРМА. ХАРАКТЕР.</span>
        <span>КОНЦЕПТ / ДЕМОНСТРАЦИОННЫЙ ПРОЕКТ</span>
        <a href="#intro" aria-label="Листайте вниз ↓ — к презентации бренда">
          Листайте вниз ↓
        </a>
      </div>
      <span className="hero-side">APEX — THE ART OF AUTOMOTIVE CARE</span>
    </section>
  );
}
function Intro() {
  return (
    <section id="intro" className="intro section">
      <div>
        <Label>ФИЛОСОФИЯ APEX</Label>
        <h2>
          Мы возвращаем
          <br />
          автомобилям
          <br />
          <em>характер.</em>
        </h2>
        <div className="intro-copy">
          <span className="small-index">[ 01 — ПОДХОД ]</span>
          <p>
            Автомобиль — больше, чем движение.
            <br />
            Это пропорции, тактильность и отражения. Мы продумали пространство, где каждую из этих
            деталей воспринимают всерьёз.
          </p>
          <Link className="text-link" to="/about">
            Познакомиться с подходом <Arrow />
          </Link>
        </div>
      </div>
      <figure>
        <img
          loading="lazy"
          src={img('detail')}
          {...responsive('detail')}
          alt="Графитовое спортивное купе на фоне горного пейзажа"
        />
        <figcaption>
          <span>КРАСОТА — В ТОЧНОСТИ</span>
          <span>APEX / 001</span>
        </figcaption>
      </figure>
    </section>
  );
}
function ServiceGrid({ all = false }: { all?: boolean }) {
  return (
    <section className="section service-section">
      <div className="section-heading">
        <div>
          <Label>ЭКСПЕРТИЗА</Label>
          <h2>
            Искусство
            <br />
            <em>совершенства.</em>
          </h2>
        </div>
        <p>
          Шесть направлений.
          <br />
          Один стандарт внимания к деталям.
        </p>
      </div>
      <div className="service-grid">
        {services.map((s, i) => (
          <Link className={`service-card service-${i}`} to={`/services/${s.slug}`} key={s.slug}>
            <img src={img(s.image)} {...responsive(s.image)} loading="lazy" alt="" />
            <div className="card-shade" />
            <div className="card-top">
              <span>0{i + 1} / APEX CARE</span>
              <Arrow />
            </div>
            <div className="card-bottom">
              <h3>{s.title}</h3>
              <p>{s.short}</p>
            </div>
          </Link>
        ))}
      </div>
      {!all && (
        <div className="section-end">
          <span>От первого осмотра до последнего блика.</span>
          <Link className="text-link" to="/services">
            Все услуги <Arrow />
          </Link>
        </div>
      )}
    </section>
  );
}
function Gallery({ full = false }: { full?: boolean }) {
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const list = projects.filter((p) => filter === 'all' || p.type === filter);
  useEffect(() => {
    if (active !== null) dialog.current?.showModal();
    else dialog.current?.close();
  }, [active]);
  function close() {
    setActive(null);
  }
  return (
    <section className="section gallery">
      <div className="section-heading">
        <div>
          <Label>ИЗБРАННЫЕ ПРОЕКТЫ</Label>
          <h2>
            Детали решают <em>всё.</em>
          </h2>
        </div>
        <p>
          Визуальные истории APEX.
          <br />
          Все проекты — демонстрационные.
        </p>
      </div>
      <div className="filters" aria-label="Фильтр проектов">
        {[
          ['all', 'Все проекты'],
          ['polishing', 'Полировка'],
          ['film', 'Защита'],
          ['interior', 'Интерьер'],
          ['coatings', 'Покрытия'],
        ].map(([id, name]) => (
          <button
            aria-pressed={id === filter}
            className={id === filter ? 'active' : ''}
            onClick={() => setFilter(id)}
            key={id}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="project-grid">
        {list.slice(0, full ? 4 : 2).map((p) => (
          <button
            className="project-card"
            key={p.title}
            onClick={() => setActive(projects.indexOf(p))}
          >
            <div className="project-image">
              <img loading="lazy" src={img(p.image)} {...responsive(p.image)} alt={p.car} />
              <span>ДЕМО-ПРОЕКТ</span>
              <span className="project-open">
                <Plus size={24} />
              </span>
            </div>
            <div className="project-title">
              <div>
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
          <span>Вдохновение для вашего следующего проекта.</span>
          <Link className="text-link" to="/projects">
            Смотреть все проекты <Arrow />
          </Link>
        </div>
      )}
      <dialog
        ref={dialog}
        onKeyDown={(e) => {
          if (active === null) return;
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            setActive((active + 1) % projects.length);
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setActive((active + projects.length - 1) % projects.length);
          }
        }}
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="lightbox"
      >
        {active !== null && (
          <>
            <button className="close-modal" onClick={close} aria-label="Закрыть просмотр">
              <X />
            </button>
            <img
              src={img(projects[active].image)}
              {...responsive(projects[active].image)}
              alt={projects[active].car}
            />
            <div className="lightbox-bottom">
              <button
                onClick={() => setActive((active + projects.length - 1) % projects.length)}
                aria-label="Предыдущий проект"
              >
                <ChevronLeft />
              </button>
              <div>
                <h3>{projects[active].title}</h3>
                <p>{projects[active].text} Демонстрационный проект.</p>
              </div>
              <button
                onClick={() => setActive((active + 1) % projects.length)}
                aria-label="Следующий проект"
              >
                <ChevronRight />
              </button>
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
function Comparison() {
  const [value, setValue] = useState(52);
  return (
    <section className="section compare-section">
      <div className="section-heading">
        <div>
          <Label>СМЕНА ПЕРСПЕКТИВЫ</Label>
          <h2>
            Разница —<br />
            <em>в отражении.</em>
          </h2>
        </div>
        <p>
          Передвиньте разделитель.
          <br />
          Цифровая симуляция на одном кадре,
          <br />а не реальный результат работ.
        </p>
      </div>
      <div className="comparison">
        <img
          src={img('black')}
          {...responsive('black')}
          alt="Исходный кадр графитового спортивного автомобиля"
        />
        <div className="before-image" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <img
            src={img('black')}
            {...responsive('black')}
            alt="Тот же кадр с приглушённым цветом для демонстрации"
          />
        </div>
        <span className="compare-tag before">ДО / СИМУЛЯЦИЯ</span>
        <span className="compare-tag after">ПОСЛЕ / СИМУЛЯЦИЯ</span>
        <div className="compare-line" style={{ left: `${value}%` }}>
          <span>↔</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          aria-label="Сравнение изображения до и после цифровой обработки"
        />
      </div>
    </section>
  );
}
function Process() {
  return (
    <section className="process section">
      <Label>ПОНЯТНЫЙ ПРОЦЕСС</Label>
      <h2>
        От диалога
        <br />к <em>совершенству.</em>
      </h2>
      <div className="process-grid">
        {[
          ['Консультация', 'Обсуждаем ваш автомобиль, задачу и желаемый результат.'],
          ['Диагностика и оценка', 'Изучаем состояние, определяем объём и согласуем смету.'],
          ['Выполнение работ', 'Двигаемся по согласованному плану с вниманием к деталям.'],
          ['Контроль качества', 'Проверяем результат и объясняем правила дальнейшего ухода.'],
        ].map(([title, text], i) => (
          <article key={title}>
            <span className="process-number">
              0{i + 1}
              <ArrowUpRight />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
function Calculator() {
  const [s, setS] = useState(0);
  const [category, setCategory] = useState(1);
  const [options, setOptions] = useState<string[]>([]);
  const opts = [
    ['wash', 'Детальная мойка', 3000],
    ['wheels', 'Очистка колёсных дисков', 4000],
    ['care', 'Уход за кожей салона', 5000],
  ] as const;
  const total =
    Math.round(services[s].price * category) +
    opts.filter((o) => options.includes(o[0])).reduce((sum, o) => sum + o[2], 0);
  return (
    <section className="section calculator">
      <div>
        <Label>ВАШ СЛЕДУЮЩИЙ ШАГ</Label>
        <h2>
          Начните
          <br />с <em>понимания.</em>
        </h2>
        <p className="muted">
          Оцените порядок бюджета.
          <br />
          Выберите услугу и параметры автомобиля.
        </p>
        <span className="small-index">ЛОКАЛЬНЫЙ РАСЧЁТ / БЕЗ ОТПРАВКИ ДАННЫХ</span>
      </div>
      <div className="calc-panel">
        <label>
          01 / Услуга
          <select value={s} onChange={(e) => setS(+e.target.value)}>
            {services.map((v, i) => (
              <option key={v.slug} value={i}>
                {v.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          02 / Категория автомобиля
          <select value={category} onChange={(e) => setCategory(+e.target.value)}>
            <option value="1">Седан / купе — ×1</option>
            <option value="1.25">Кроссовер — ×1,25</option>
            <option value="1.5">Внедорожник — ×1,5</option>
          </select>
        </label>
        <fieldset>
          <legend>03 / Дополнительные опции</legend>
          {opts.map(([id, title, price]) => (
            <label className="checkbox" key={id}>
              <input
                type="checkbox"
                checked={options.includes(id)}
                onChange={() =>
                  setOptions(
                    options.includes(id) ? options.filter((v) => v !== id) : [...options, id],
                  )
                }
              />
              <span>{title}</span>
              <span>+{price.toLocaleString('ru-RU')} ₽</span>
            </label>
          ))}
        </fieldset>
        <div className="total">
          <span>Ориентировочная стоимость</span>
          <output aria-live="polite">
            {total.toLocaleString('ru-RU')} <small>₽</small>
          </output>
        </div>
        <p className="fineprint">
          Демонстрационный расчёт. Не является коммерческим предложением. Базовый тариф{' '}
          {services[s].price.toLocaleString('ru-RU')} ₽ × коэффициент категории + выбранные опции.
        </p>
      </div>
    </section>
  );
}
function FAQ() {
  return (
    <section className="section faq">
      <div>
        <Label>ПОЛЕЗНО ЗНАТЬ</Label>
        <h2>
          Без лишних
          <br />
          <em>вопросов.</em>
        </h2>
      </div>
      <div>
        {faq.map(([q, a], i) => (
          <details key={q}>
            <summary>
              <span className="faq-num">0{i + 1}</span>
              {q}
              <Plus className="faq-plus" size={20} />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
function CTA() {
  return (
    <section className="cta">
      <img
        loading="lazy"
        src={img('black')}
        {...responsive('black')}
        alt="Графитовое спортивное купе в движении"
      />
      <div className="cta-content">
        <Label>СЛЕДУЮЩАЯ ГЛАВА — ВАША</Label>
        <h2>
          ВАШ АВТОМОБИЛЬ
          <br />
          ЗАСЛУЖИВАЕТ <em>БОЛЬШЕГО.</em>
        </h2>
        <Button to="/contacts">Обсудить проект</Button>
        <span className="fineprint">Концепт. Кнопка открывает демонстрационную форму.</span>
      </div>
    </section>
  );
}
function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <ServiceGrid />
      <Gallery />
      <Comparison />
      <Process />
      <Calculator />
      <FAQ />
      <CTA />
    </>
  );
}
function PageHead({ label, title, text }: { label: string; title: string; text: string }) {
  return (
    <section className="page-head section">
      <Label>{label}</Label>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
function Services() {
  return (
    <>
      <PageHead
        label="APEX / УСЛУГИ"
        title="Внимание. В каждой линии."
        text="От восстановления формы до защиты поверхности — продуманный уход за автомобилем на каждом этапе."
      />
      <ServiceGrid all />
      <Calculator />
      <FAQ />
      <CTA />
    </>
  );
}
function ServicePage() {
  const { slug } = useParams();
  const s = services.find((s) => s.slug === slug);
  if (!s) return <NotFound />;
  return (
    <>
      <section className="service-hero">
        <img src={img(s.image)} {...responsive(s.image)} alt={s.title} />
        <div>
          <Link className="text-link" to="/services">
            ← Все услуги
          </Link>
          <Label>APEX / НАПРАВЛЕНИЕ</Label>
          <h1>{s.title}</h1>
          <p>{s.short}</p>
        </div>
      </section>
      <section className="section service-detail">
        <div>
          <Label>ТОЧНОСТЬ ПОДХОДА</Label>
          <h2>
            Результат начинается
            <br />с <em>подготовки.</em>
          </h2>
          <p>{s.desc}</p>
          <Button to="/contacts">Обсудить задачу</Button>
        </div>
        <div>
          <div className="service-facts">
            <p>
              Демо-тариф<strong>от {s.price.toLocaleString('ru-RU')} ₽</strong>
            </p>
            <p>
              Ориентир по срокам<strong>{s.time}</strong>
            </p>
          </div>
          <p className="fineprint">
            Иллюстративные условия. Точная оценка в реальной студии возможна только после осмотра.
          </p>
          {s.steps.map((step, i) => (
            <div className="detail-step" key={step}>
              <span>0{i + 1}</span>
              <h3>{step}</h3>
            </div>
          ))}
        </div>
      </section>
      <FAQ />
      <CTA />
    </>
  );
}
function About() {
  return (
    <>
      <PageHead
        label="APEX / ФИЛОСОФИЯ"
        title="С уважением к форме."
        text="APEX AUTO — концепция автомобильной студии, где техническая точность встречается с чувством прекрасного."
      />
      <Intro />
      <section className="section manifesto">
        <Label>ПРИНЦИПЫ КОНЦЕПЦИИ</Label>
        {[
          [
            'Сначала — понять.',
            'Ни одного лишнего вмешательства. Метод работы выбирается после осмотра и обсуждения задачи.',
          ],
          [
            'Точность важнее обещаний.',
            'Прозрачный состав работ, понятная смета и реалистичные ожидания от результата.',
          ],
          [
            'Красота требует заботы.',
            'Качество проявляется не только в блеске, но и в деталях, которые не сразу замечаешь.',
          ],
        ].map(([title, text]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
        <p className="fineprint">
          Это авторская концепция для портфолио. У бренда нет действующей мастерской, подтверждённой
          истории, наград или клиентских отзывов.
        </p>
      </section>
      <Process />
      <CTA />
    </>
  );
}
function Contacts() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <PageHead
        label="APEX / ДИАЛОГ"
        title="Начнём с вашего автомобиля."
        text="Демонстрация первого знакомства со студией. APEX AUTO — вымышленный бренд, коммерческие заявки здесь не принимаются."
      />
      <section className="section contact-layout">
        <div>
          <h2>
            Хороший результат
            <br />
            начинается с <em>диалога.</em>
          </h2>
          <p className="muted">
            Расскажите о задаче в форме справа, чтобы посмотреть сценарий интерфейса. Не вводите
            настоящие персональные данные.
          </p>
          <div className="demo-note">
            <Label>ДЕМОНСТРАЦИОННЫЙ РЕЖИМ</Label>
            <p>
              Нет реального адреса, телефона и приёма заявок. Поля не сохраняются в браузере и не
              отправляются на сервер.
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.currentTarget.reset();
            setSent(true);
          }}
        >
          <label>
            Как к вам обращаться
            <input
              data-field="demo-name"
              placeholder="Например, Алексей (тест)"
              autoComplete="off"
              maxLength={80}
            />
          </label>
          <label>
            Автомобиль
            <input
              data-field="demo-car"
              placeholder="Марка и модель"
              autoComplete="off"
              maxLength={100}
            />
          </label>
          <label>
            Интересующая услуга
            <select data-field="demo-service">
              {services.map((s) => (
                <option key={s.slug}>{s.title}</option>
              ))}
            </select>
          </label>
          <label>
            Ваша задача
            <textarea
              data-field="demo-message"
              placeholder="Опишите пожелания — без персональных данных"
              maxLength={1500}
            />
          </label>
          <p className="fineprint">
            Отправка имитируется локально. Настоящие контактные данные не нужны.
          </p>
          <button className="button" type="button" onClick={(e) => e.currentTarget.form?.requestSubmit()}>
            Показать демо-отправку <Arrow />
          </button>
          {sent && (
            <p role="status" className="success">
              Демонстрация завершена. Данные не отправлены и не сохранены. Поля очищены.
            </p>
          )}
        </form>
      </section>
    </>
  );
}
function NotFound() {
  return (
    <PageHead
      label="404 / МАРШРУТ НЕ НАЙДЕН"
      title="Здесь другой поворот."
      text="Вернитесь на главную через логотип APEX или откройте услуги в меню."
    />
  );
}
export function App() {
  const loc = useLocation();
  const path = loc.pathname.replace(/\/+$/, '') || '/';
  useEffect(() => {
    window.scrollTo(0, 0);
    const service = services.find((s) => path === `/services/${s.slug}`);
    const title =
      service?.title ||
      {
        '/': 'Совершенство в каждой детали',
        '/services': 'Услуги',
        '/projects': 'Демонстрационные проекты',
        '/about': 'О концепции',
        '/contacts': 'Контакты · демо-форма',
      }[path] ||
      'Страница не найдена';
    document.title = `${title} — APEX AUTO`;
    const desc =
      service?.desc ||
      `${title}. APEX AUTO — демонстрационный концепт автомобильной студии. Без приёма коммерческих заявок.`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      const url = new URL(pagePath(path === '/' ? '/' : `${path}/`), canonical.href).href;
      canonical.href = url;
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    }
  }, [path]);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('.process-grid article,.manifesto article').forEach((el) => {
      el.classList.add('reveal-ready');
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [path]);
  return (
    <>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <Header />
      <main id="main" key={path}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServicePage />} />
          <Route
            path="/projects"
            element={
              <>
                <PageHead
                  label="APEX / ГАЛЕРЕЯ"
                  title="Эстетика в движении."
                  text="Визуальные исследования формы, цвета и фактуры. Все представленные проекты демонстрационные; фотографии не подтверждают выполненные работы."
                />
                <Gallery full />
                <Comparison />
                <CTA />
              </>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
