import {IEvents} from "./events";

export abstract class Model<T> {
    constructor(data: Partial<T>, protected events: IEvents) {
        Object.assign(this, data);
    }

    // Сообщить что модель поменялась
    emitChanges(event: string, payload?: object) {
        this.events.emit(event, payload ?? {});
    }

}

// Проверка на модель
export const isModel = (obj: unknown): obj is Model<any> => {
    return obj instanceof Model;
}