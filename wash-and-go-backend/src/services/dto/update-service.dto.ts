export class UpdateServiceDto {
  name?: string;
  description?: string;
  price_small?: number;
  price_medium?: number;
  price_large?: number;
  price_extra_large?: number;
  lube_prices?: Record<string, number>;
}
