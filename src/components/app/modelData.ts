import { Model } from '../base/model';
import { IEvents } from '../base/events';
import { IOrder, IProduct } from '../../types';

export class AppModel extends Model<{
	catalog: IProduct[];
	basket: string[];
	order: Partial<IOrder>;
	formErrors: Record<string, string>;
}> {
	catalog: IProduct[] = [];
	basket: string[] = [];
	order: Partial<IOrder> = {
		payment: '',
		address: '',
		email: '',
		phone: '',
		items: [],
	};
	formErrors: Record<string, string> = {};

	constructor(
		data: Partial<{
			catalog: IProduct[];
			basket: string[];
			order: Partial<IOrder>;
			formErrors: Record<string, string>;
		}>,
		events: IEvents
	) {
		// Инициализируем дефолтные значения
		const defaults: {
			catalog: IProduct[];
			basket: string[];
			order: Partial<IOrder>;
			formErrors: Record<string, string>;
		} = {
			catalog: [],
			basket: [],
			order: {
				payment: '',
				address: '',
				email: '',
				phone: '',
				items: [] as string[],
			},
			formErrors: {},
		};

		super(Object.assign({}, defaults, data), events);

		this.catalog = this.catalog || [];
		this.basket = this.basket || [];
		this.order = this.order || defaults.order;
		this.formErrors = this.formErrors || {};

		// Подписываемся на события изменения полей заказа
		this.events.on(
			'orderAddress.payment:change',
			this.handleOrderFieldChange.bind(this)
		);
		this.events.on(
			'orderAddress.address:change',
			this.handleOrderFieldChange.bind(this)
		);
		this.events.on(
			'orderContact.email:change',
			this.handleOrderFieldChange.bind(this)
		);
		this.events.on(
			'orderContact.phone:change',
			this.handleOrderFieldChange.bind(this)
		);
	}

	// Обрабатывает изменения полей заказа
	private handleOrderFieldChange(data: {
		field: keyof IOrder;
		value: string;
	}): void {
		if (data && data.field && data.value !== undefined) {
			this.setOrderField(data.field, data.value);

			// Валидируем данные в зависимости от типа поля
			if (data.field === 'payment' || data.field === 'address') {
				this.validateOrderAddress();
			} else if (data.field === 'email' || data.field === 'phone') {
				this.validateOrderContact();
			}
		}
	}

	// Устанавливает каталог товаров.
	setCatalog(items: IProduct[]): void {
		this.catalog = items || [];
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	//Возвращает товар по идентификатору.
	getProductById(id: string): IProduct | undefined {
		return (this.catalog || []).find((item) => item.id === id);
	}

	// Проверяет, находится ли товар в корзине.
	isInBasket(id: string): boolean {
		try {
			const currentBasket = this.basket || [];
			return Array.isArray(currentBasket) && currentBasket.includes(id);
		} catch (error) {
			console.error('Ошибка при проверке товара в корзине:', error);
			return false;
		}
	}

	toggleBasketItem(id: string) {
		this.basket = this.basket.includes(id)
			? this.basket.filter((item) => item !== id)
			: [...this.basket, id];
		this.updateOrderItems();
	}

	private updateOrderItems() {
		this.order.items = this.basket;
		this.order.total = this.getTotal();
	}

	clearBasket(): void {
		this.basket = [];
	}

	// Возвращает товары из корзины с полной информацией.
	getBasketItems(): IProduct[] {
		try {
			const currentBasket = this.basket || [];
			return currentBasket
				.map((id) => this.getProductById(id))
				.filter((item): item is IProduct => item !== undefined);
		} catch (error) {
			console.error('Ошибка при получении товаров корзины:', error);
			return [];
		}
	}

	// Вычисляет общую стоимость товаров в корзине.
	getTotal(): number {
		try {
			return this.getBasketItems().reduce(
				(total, item) => total + item.price,
				0
			);
		} catch (error) {
			console.error('Ошибка при расчете общей стоимости:', error);
			return 0;
		}
	}

	// Устанавливает конкретное поле заказа.
	setOrderField(field: keyof IOrder, value: string): void {
		this.order = {
			...this.order,
			[field]: value,
		};
	}

	validateOrderAddress(): boolean {
		const errors: Record<string, string> = {};
		const currentOrder = this.order || {};

		// Проверка адреса
		if (!currentOrder.address || currentOrder.address.trim().length < 5) {
			errors.address = 'Адрес должен содержать не менее 5 символов';
			console.log('Ошибка валидации адреса:', currentOrder.address);
		}

		// Проверка способа оплаты
		if (
			!currentOrder.payment ||
			!['card', 'cash'].includes(currentOrder.payment)
		) {
			errors.payment = 'Выберите способ оплаты';
			console.log('Ошибка валидации оплаты:', currentOrder.payment);
		}

		this.formErrors = errors;

		const isValid = Object.keys(errors).length === 0;

		// Отправляем событие о результатах валидации с явным указанием состояния валидности
		this.events.emit('orderAddress:validation', {
			valid: isValid,
			errors: Object.values(errors),
		});

		// Дополнительно отправим событие
		this.events.emit('orderAddress:validationErrors', {
			valid: isValid,
			errors: Object.values(errors),
		});

		return isValid;
	}

	// Валидирует форму контактных данных.
	validateOrderContact(): boolean {
		const errors: Record<string, string> = {};
		const currentOrder = this.order || {};

		// Регулярное выражение для проверки email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		// Проверка email
		if (!currentOrder.email || !emailRegex.test(currentOrder.email)) {
			errors.email = 'Укажите корректный email';
		}

		// Проверка телефона
		if (!currentOrder.phone || currentOrder.phone.trim().length < 10) {
			errors.phone = 'Укажите корректный номер телефона (не менее 10 символов)';
		} else if (!/^[\d+]+$/.test(currentOrder.phone)) {
			errors.phone = 'Номер телефона должен содержать только цифры и символ +';
		}

		this.formErrors = errors;

		const isValid = Object.keys(errors).length === 0;

		// Отправляем событие о результатах валидации
		this.events.emit('orderContact:validationResult', {
			valid: isValid,
			errors: Object.values(errors),
		});

		return isValid;
	}

	// Валидирует полный заказ перед отправкой.
	validateOrder(): boolean {
		const addressValid = this.validateOrderAddress();
		const contactValid = this.validateOrderContact();

		// Проверяем наличие товаров в корзине
		const currentBasket = this.basket || [];
		if (currentBasket.length === 0) {
			this.formErrors = {
				...this.formErrors,
				items: 'Корзина пуста',
			};
			return false;
		}

		return addressValid && contactValid;
	}

	resetOrder(): void {
		this.order = {
			payment: '',
			address: '',
			email: '',
			phone: '',
			items: [],
		};

		// Очищаем ошибки форм
		this.formErrors = {};

		// Отправляем событие о сбросе заказа
		this.events.emit('order:reset', { order: this.order });
	}
}
