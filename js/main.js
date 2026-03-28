import { loadHtmlPartials } from './modules/htmlLoader.js';
import { initSiteInteractions } from './modules/init.js';

async function bootstrap() {
	await loadHtmlPartials();
	initSiteInteractions();
}

bootstrap();
