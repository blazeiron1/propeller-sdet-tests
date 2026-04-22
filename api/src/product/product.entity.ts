import { ObjectType, Field, Int, Float, ID, registerEnumType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Image } from '../image/image.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});

@ObjectType()
@Entity()
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field(() => Float)
  @Column({ type: 'int' })
  price: number;

  @Field(() => ProductStatus)
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Field()
  @Column()
  tenantId: string;

  @Field(() => [Image], { nullable: true })
  @OneToMany(() => Image, (image) => image.product)
  images?: Image[];
}
