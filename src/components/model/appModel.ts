import { AppEvents, IOrder, IProduct, OrderPayment } from '../../types/index';
import { IEvents } from '../base/events';

export class AppModel {
	private _itemList: IProduct[] = [];
	private _basketList: string[] = [];
	private _totalPrice: number = 0;
	order: Partial<IOrder> = {};

	constructor(protected events: IEvents) {}

	get itemList(): IProduct[] {
		return this._itemList;
	}

	set totalPrice(price: number) {
		this._totalPrice = price;
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
}
