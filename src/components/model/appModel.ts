import { AppEvents, IOrder, IProduct, OrderPayment } from '../../types/index';
import { IEvents } from '../base/events';

interface IValidateFormCheck {
	payment: boolean;
	address: boolean;
	email: boolean;
	phone: boolean;
}

export class AppModel {
	private _itemList: IProduct[] = [];
	private _basketList: string[] = [];
	private _totalPrice: number = 0;
	static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	static phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
	order: Partial<IOrder> = {};
	validateFormCheck: Partial<IValidateFormCheck> = {
		payment: false,
		address: false,
		email: false,
		phone: false,
	};

	constructor(protected events: IEvents) {}

	get itemList(): IProduct[] {
		return this._itemList;
	}

	set totalPrice(price: number) {
		this._totalPrice = price;
	}

	set orderPaymentType(value: OrderPayment) {
		this.order.payment = value;
		this.validateFormCheck.payment = true;
	}

	basketCount(): number {
		return this._basketList.length;
	}

	set basketAdd(id: string) {
		this._basketList.push(id);
		this.events.emit(AppEvents.BasketChanged);
	}

	basketRemove(id: string) {
		this._basketList = this._basketList.filter((itemId) => itemId !== id);
		this.events.emit(AppEvents.BasketChanged);
	}

	set itemList(items: IProduct[]) {
		this._itemList = items.length > 0 ? items : [];
	}

	getItemById(id: string): IProduct | undefined {
		return this._itemList.find((item) => item.id === id);
	}

	getBasketItems(): IProduct[] {
		try {
			const currentBasket = this._basketList
				.map((id) => this.getItemById(id))
				.filter((item): item is IProduct => item !== undefined);
			return currentBasket;
		} catch (error) {
			console.error('Ошибка при получении товаров из корзины:', error);
			return [];
		}
	}

	clearBasket(): void {
		this._basketList = [];
	}

	avilabilityInBasket(id: string): boolean {
		return this._basketList.includes(id);
	}

	addToOrderData(orderData: Partial<IOrder>): void {
		if (orderData.payment && orderData.address) {
			this.order.payment = orderData.payment as OrderPayment;
			this.order.address = orderData.address;
			Object.assign(this.order);
		} else if (orderData.email && orderData.phone) {
			this.order.email = orderData.email;
			this.order.phone = orderData.phone;
		} else {
			throw new Error('Неверные данные');
		}
	}

	getOrderData(): IOrder {
		this.order.total = this._totalPrice;
		this.order.items = this._basketList;
		return this.order as IOrder;
	}

	clearValidateFormCheck(): void {
		this.validateFormCheck = {
			payment: false,
			address: false,
			email: false,
			phone: false,
		};
	}

	validateCheckFormOrder(): boolean {
		if (this.validateFormCheck.payment && this.validateFormCheck.address) {
			this.events.emit(AppEvents.FormOrderIsValid);
			return true;
		} else {
			this.events.emit(AppEvents.FormOrderIsNoValid);
			return false;
		}
	}

	validateFormOrder(valueAddress: string): string {
		const isPaymentSelected = this.validateFormCheck.payment;
		const isAddressValid = valueAddress.trim().length >= 10;

		let errorMessage = '';

		if (!isAddressValid) {
			this.validateFormCheck.address = false;
			errorMessage = 'Адрес должен содержать не менее 10 символов. ';
			return errorMessage;
		} else {
			this.order.address = valueAddress;
			this.validateFormCheck.address = true;
		}

		if (!isPaymentSelected) {
			errorMessage = 'Выберите способ оплаты.';
			return errorMessage;
		}

		return errorMessage;
	}

	validateContact(valueEmail: string, valuePhone: string) {
		let errorMessage = '';

		if (valueEmail) {
			const email = valueEmail.trim();
			const isValidRegExpEmail = AppModel.emailRegex.test(email);
			const isValidLengthEmail = valueEmail.length > 10;

			if (!isValidLengthEmail) {
				this.validateFormCheck.email = false;
				errorMessage = 'Email должен состоять не менее чем из 10 символов';
				return errorMessage;
			} else if (!isValidRegExpEmail) {
				this.validateFormCheck.email = false;
				errorMessage = 'Введите корректный email';
				return errorMessage;
			} else {
				this.validateFormCheck.email = true;
				this.order.email = valueEmail;
			}
		}

		if (valuePhone) {
			const phone = valuePhone.trim();
			const isValidRegExpPhone = AppModel.phoneRegex.test(phone);
			if (!isValidRegExpPhone) {
				this.validateFormCheck.phone = false;
				errorMessage = 'Введите корректный номер';
				return errorMessage;
			} else {
				this.validateFormCheck.phone = true;
				this.order.phone = valuePhone;
			}
		} else {
			errorMessage = 'Введите номер телефона';
			this.validateFormCheck.phone = false;
			return errorMessage;
		}

		this.validateFormCheck.email && this.validateFormCheck.phone
			? this.events.emit(AppEvents.FormContactIsValid)
			: this.events.emit(AppEvents.FormContactIsNoValid);

		return '';
	}
}
