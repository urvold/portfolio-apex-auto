/** Vite sets this at build time; supports root hosting and GitHub project Pages. */
export const BASE_PATH = import.meta.env.BASE_URL;
export const assetUrl = (path: string) => `${BASE_PATH}${path.replace(/^\/+/, '')}`;
export const pagePath = (path: string) => assetUrl(path);
