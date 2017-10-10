import { root } from './index';

const introSelector = { css: '.App-intro' };
const headerSelector = { css: '.App-header > h2' };

export const intro = () => root().findElement(introSelector);

export const header = () => root().findElement(headerSelector);
