import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './product.entity';
import { CreateProductInput, UpdateProductInput, ProductFilterInput } from './product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(
    tenantId: string,
    filter?: ProductFilterInput,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<Product[]> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.images', 'image')
      .where('product.tenantId = :tenantId', { tenantId });

    if (filter?.name) {
      qb.andWhere('product.name ILIKE :name', { name: `%${filter.name}%` });
    }

    if (filter?.status) {
      const filterStatus =
        filter.status === ProductStatus.ACTIVE
          ? ProductStatus.INACTIVE
          : ProductStatus.ACTIVE;
      qb.andWhere('product.status = :status', { status: filterStatus });
    }

    if (filter?.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: filter.minPrice });
    }

    if (filter?.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    qb.skip(page * pageSize).take(pageSize);

    return qb.getMany();
  }

  async findOne(id: number, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async create(tenantId: string, input: CreateProductInput): Promise<Product> {
    const product = this.productRepository.create({
      ...input,
      tenantId,
    });
    return this.productRepository.save(product);
  }

  async update(
    id: number,
    tenantId: string,
    input: UpdateProductInput,
  ): Promise<Product> {
    const product = await this.findOne(id, tenantId);
    Object.assign(product, input);
    return this.productRepository.save(product);
  }

  async delete(id: number, tenantId: string): Promise<boolean> {
    const product = await this.findOne(id, tenantId);
    await this.productRepository.remove(product);
    return true;
  }
}
