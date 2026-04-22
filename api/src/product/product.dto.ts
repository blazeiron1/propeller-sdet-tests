import { InputType, Field, Float } from '@nestjs/graphql';
import { ProductStatus } from './product.entity';

@InputType()
export class CreateProductInput {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field(() => ProductStatus, { nullable: true, defaultValue: ProductStatus.ACTIVE })
  status?: ProductStatus;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field(() => ProductStatus, { nullable: true })
  status?: ProductStatus;
}

@InputType()
export class ProductFilterInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => ProductStatus, { nullable: true })
  status?: ProductStatus;

  @Field(() => Float, { nullable: true })
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  maxPrice?: number;
}
