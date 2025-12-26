import {Product} from './Product.model';

export interface Queue {
  id: string;
  x: number;
  y: number;
  products: Product[];
}
