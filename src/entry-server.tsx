import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';
import { services } from './data';
import { BASE_PATH, pagePath } from './paths';
export const routes = [
  '/',
  '/services',
  '/projects',
  '/about',
  '/contacts',
  ...services.map((s) => `/services/${s.slug}`),
];
export function render(path: string) {
  const s = services.find((s) => path === `/services/${s.slug}`);
  const title =
    s?.title ||
    {
      '/': 'Совершенство в каждой детали',
      '/services': 'Услуги',
      '/projects': 'Демонстрационные проекты',
      '/about': 'О концепции',
      '/contacts': 'Контакты · демо-форма',
    }[path] ||
    'Страница не найдена';
  return {
    html: renderToString(
      <StaticRouter basename={BASE_PATH} location={pagePath(path)}>
        <App />
      </StaticRouter>,
    ),
    title: `${title} — APEX AUTO`,
    description:
      s?.desc ||
      `${title}. APEX AUTO — демонстрационный концепт автомобильной студии. Без приёма коммерческих заявок.`,
  };
}
