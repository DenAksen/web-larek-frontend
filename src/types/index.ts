export type ProductCategory =
	| 'софт-скил'
	| 'хард-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка';

// Описание товара
export interface IProduct {
	id: string;
	title: string;
	description: string;
	price: number;
	category: ProductCategory;
	image: string;
}

export interface ICard {
	id: string;
	title: string;
	price: number | null;
	category?: string;
	description?: string | string[];
	image?: string;
	isInCart?: boolean;
}

export interface IBasketCardData extends ICard {
	index: number;
}

//Базовый интерфейс полей формы
export interface FormFields {
	[key: string]: unknown;
}

// Интерфейс формы адреса и оплаты
export interface IOrderAddressFormState extends FormFields {
	payment: string;
	address: string;
}

// Интерфейс формы контактных данных
export interface IOrderContactFormState extends FormFields {
	email: string;
	phone: string;
}

// Данные заказа
export interface IOrder extends IOrderAddressFormState, IOrderContactFormState {
	items: string[];
}

// Типы доступных методов оплаты
export type PaymentMethod = 'card' | 'cash';

// Ошибки формы заказа
export type FormErrors = Partial<Record<keyof IOrder | 'items', string>>;

// Результат оформления заказа
export interface IOrderResult {
	id: string;
	total: number;
}

// Состояние приложения
export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}

// Состояние представления корзины
export interface IBasketView {
	// Массив HTML-элементов товаров в корзине
	items: HTMLElement[];
	// Общая сумма товаров в корзине
	total: number;
	// Необязательный массив идентификаторов выбранных товаров
	selected?: string[]; // Можно Удалить
}

export interface IFormState {
	// Флаг валидности формы
	valid: boolean;
	// Массив сообщений об ошибках
	errors: string[];
}

// Интерфейс данных для модального окна
export interface IModalData {
	// HTML-элемент с содержимым модального окна
	content: HTMLElement;
}

// Интерфейс для состояния компонента успешного заказа
export interface IOrderSuccessState {
	title: string;
	amount: string;
}
export interface ISuccessActions {
	// Функция-обработчик нажатия на кнопку закрытия
	onClick: () => void;
}

// Интерфейс ClientApi
export interface IClientAPI {
	getProductList: () => Promise<IProduct[]>;
	getProductItem: (id: string) => Promise<IProduct>;
	orderProducts: (order: IOrder) => Promise<IOrderResult>;
}

// Интерфейс, описывающий состояние страницы
export interface IPage {
	// Количество товаров в корзине
	counter: number;
	// Массив HTML-элементов для каталога
	catalog: HTMLElement[];
	// Флаг блокировки страницы
	locked: boolean;
}

export interface ValidationResult {
	valid: boolean;
	errors: string[];
}

export interface IAppTemplates {
	cardCatalog: HTMLTemplateElement;
	cardPreview: HTMLTemplateElement;
	cardBasket: HTMLTemplateElement;
	basket: HTMLTemplateElement;
	orderAddress: HTMLTemplateElement;
	orderContact: HTMLTemplateElement;
	success: HTMLTemplateElement;
}
