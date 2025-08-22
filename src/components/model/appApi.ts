import { Api, ApiListResponse } from '../base/api';
import { IProduct, IOrder, IOrderResult } from '../../types';

export class AppApi extends Api {
	readonly baseCdn: string;

	constructor(baseUrl: string, baseCdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.baseCdn = baseCdn;
	}

	getItemList(): Promise<IProduct[]> {
		return this.get('/product').then((result: ApiListResponse<IProduct>) => {
			return result.items.map((item) => {
				return {
					...item,
					image: this.baseCdn + item.image,
				};
			});
		});
	}

	postOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
