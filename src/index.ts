import './scss/styles.scss';
import { AppPresenter } from './components/app/appPresenter';
import { ensureElement } from './utils/utils';
import { IAppTemplates } from './types';

const templates: IAppTemplates = {
	cardCatalog: ensureElement<HTMLTemplateElement>('#card-catalog'),
	cardPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
	cardBasket: ensureElement<HTMLTemplateElement>('#card-basket'),
	basket: ensureElement<HTMLTemplateElement>('#basket'),
	orderAddress: ensureElement<HTMLTemplateElement>('#order'),
	orderContact: ensureElement<HTMLTemplateElement>('#contacts'),
	success: ensureElement<HTMLTemplateElement>('#success'),
};

// Запуск приложения
const presenter = new AppPresenter(templates);
presenter.init();
