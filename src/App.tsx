import { useEffect, useRef, useState } from 'react';

import { Routes, Route, Link, useLocation, useParams } from 'react-router-dom';
import { ArrowUpRight, Menu, X, Plus } from 'lucide-react';
import { services, faq, serviceNotes, calculatorOptions } from './data';
import { pagePath } from './paths';
import { Arrow, Label, Button, img, responsive } from './components/ui';
import { Hero } from './components/Hero';
import { Anatomy } from './components/Anatomy';
import { Gallery } from './components/Gallery';
import { Comparison } from './components/Comparison';

function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const loc = useLocation();
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 24);
    scroll();
    window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === 'Tab' && open) {
        const links = Array.from(
          navigation.current?.querySelectorAll<HTMLAnchorElement>('a') || [],
        );
        const first = links[0];
        const last = toggle.current;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', escape);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) navigation.current?.querySelector('a')?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', escape);
      document.body.style.overflow = '';
    };
  }, [open]);
  return (
    <header className={scrolled ? 'is-scrolled' : ''}>
      <Link to="/" className="logo">
        APEX<span>AUTO / ESTHETICS</span>
      </Link>
      <nav
        id="main-navigation"
        ref={navigation}
        aria-label="Основная навигация"
        className={open ? 'open' : ''}
      >
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
        <div className="mobile-menu-meta">
          <span>APEX AUTO / 2.0</span>
          <p>
            Концепт автомобильной эстетики.
            <br />
            Коммерческие заявки не принимаются.
          </p>
        </div>
      </nav>
      <button
        ref={toggle}
        aria-controls="main-navigation"
        className="menu-toggle"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span>{open ? 'Закрыть' : 'Меню'}</span>
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
function Intro() {
  return (
    <section id="intro" className="intro section">
      <div>
        <Label>ВНИМАНИЕ — ЭТО МЕТОД</Label>
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
          src={img('workshop')}
          {...responsive('workshop', '(max-width: 600px) 100vw, 40vw')}
          alt="Мастер выполняет полировку кузова машинкой"
        />
        <figcaption>
          <span>КРАСОТА — В ТОЧНОСТИ</span>
          <span>ИЛЛЮСТРАЦИЯ ПРОЦЕССА</span>
        </figcaption>
      </figure>
    </section>
  );
}
function ServiceGrid({ all = false }: { all?: boolean }) {
  return (
    <section className={`section service-section ${all ? 'all-services' : 'home-services'}`}>
      <div className="section-heading">
        <div>
          <Label>02 / НАПРАВЛЕНИЯ РАБОТЫ</Label>
          <h2 className={all ? 'sr-only' : ''}>
            Точность —<br />
            <em>наша специализация.</em>
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
            <img
              src={img(s.image)}
              {...responsive(
                s.image,
                all || i === 0
                  ? '(max-width: 600px) 100vw, 50vw'
                  : '(max-width: 600px) 82px, 104px',
              )}
              loading="lazy"
              alt=""
            />
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
function Process() {
  return (
    <section className="process section">
      <Label>05 / ПРОЦЕСС БЕЗ ЛИШНИХ ДВИЖЕНИЙ</Label>
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
  const opts = calculatorOptions;
  const total =
    Math.round(services[s].price * category) +
    opts.filter((o) => options.includes(o[0])).reduce((sum, o) => sum + o[2], 0);
  return (
    <section className="section calculator">
      <div>
        <Label>06 / ОРИЕНТИР ПО БЮДЖЕТУ</Label>
        <h2>
          Ваш автомобиль.
          <br />
          <em>Ваш сценарий.</em>
        </h2>
        <p className="muted">
          Оцените порядок бюджета.
          <br />
          Выберите услугу и параметры автомобиля.
        </p>
        <div className="calc-assurance">
          <span>01 / Открытые демонстрационные тарифы</span>
          <span>02 / Прозрачная формула расчёта</span>
          <span>03 / Всё происходит в вашем браузере</span>
        </div>
        <a href="#calc-options" className="text-link">
          Выбрать параметры <Arrow />
        </a>
      </div>
      <div className="calc-panel" id="calc-options">
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
      <div className="brand-rail" aria-hidden="true">
        <span>
          RESTORE <ArrowUpRight aria-hidden="true" size={24} />
        </span>
        <span>
          REFINE <ArrowUpRight aria-hidden="true" size={24} />
        </span>
        <span>
          PROTECT <ArrowUpRight aria-hidden="true" size={24} />
        </span>
      </div>
      <Anatomy />
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
      <div className="page-head-marker" aria-hidden="true">
        A<span>APEX / ESTHETICS</span>
      </div>
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
        <img
          src={img(s.image)}
          {...responsive(s.image, '100vw')}
          alt={s.title}
          fetchPriority="high"
        />
        <div>
          <Link className="text-link" to="/services">
            ← Все услуги
          </Link>
          <Label>APEX / НАПРАВЛЕНИЕ</Label>
          <h1>{s.title}</h1>
          <p>{s.short}</p>
          <div className="service-hero-action">
            <Button to="/contacts">Обсудить задачу</Button>
          </div>
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
      <section className="section service-note">
        <div>
          <Label>ВАЖНЫЕ ДЕТАЛИ</Label>
          <h2>{serviceNotes[s.slug].title}</h2>
          <p>{serviceNotes[s.slug].care}</p>
        </div>
        <ul>
          {serviceNotes[s.slug].points.map((point, i) => (
            <li key={point}>
              <span>0{i + 1}</span>
              {point}
            </li>
          ))}
        </ul>
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
        title="Обсудим автомобиль."
        text="Демо-форма вымышленной студии. Данные никуда не отправляются и не сохраняются."
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
          onKeyDown={(e) => {
            if (
              e.key === 'Enter' &&
              e.target instanceof HTMLInputElement &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              e.currentTarget.requestSubmit();
            }
          }}
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
          <button
            className="button"
            type="button"
            onClick={(e) => e.currentTarget.form?.requestSubmit()}
          >
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
  const previousPath = useRef(path);
  const transitioning = previousPath.current !== path;
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (previousPath.current !== path) {
      document.getElementById('main')?.focus({ preventScroll: true });
      previousPath.current = path;
    }
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
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12 },
    );
    document
      .querySelectorAll(
        '.section-heading,.intro figure,.process-grid article,.manifesto article,.service-note',
      )
      .forEach((el) => {
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
      <main id="main" key={path} className={transitioning ? 'route-enter' : ''} tabIndex={-1}>
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
