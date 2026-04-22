import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { CreateProductInput, UpdateProductInput, ProductFilterInput } from './product.dto';
import { TenantId } from '../common/tenant.decorator';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private productService: ProductService) {}

  @Query(() => [Product], { name: 'products' })
  async getProducts(
    @TenantId() tenantId: string,
    @Args('filter', { nullable: true }) filter?: ProductFilterInput,
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page?: number,
    @Args('pageSize', { type: () => Int, nullable: true, defaultValue: 10 }) pageSize?: number,
  ): Promise<Product[]> {
    return this.productService.findAll(tenantId, filter, page, pageSize);
  }

  @Query(() => Product, { name: 'product' })
  async getProduct(
    @TenantId() tenantId: string,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Product> {
    return this.productService.findOne(id, tenantId);
  }

  @Mutation(() => Product)
  async createProduct(
    @TenantId() tenantId: string,
    @Args('input') input: CreateProductInput,
  ): Promise<Product> {
    return this.productService.create(tenantId, input);
  }

  @Mutation(() => Product)
  async updateProduct(
    @TenantId() tenantId: string,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateProductInput,
  ): Promise<Product> {
    return this.productService.update(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteProduct(
    @TenantId() tenantId: string,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.productService.delete(id, tenantId);
  }
}
