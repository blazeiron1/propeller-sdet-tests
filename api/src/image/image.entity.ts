import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../product/product.entity';

@ObjectType()
@Entity()
export class Image {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  url: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Field()
  @Column()
  tenantId: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  productId?: number;

  @Field(() => Product, { nullable: true })
  @ManyToOne(() => Product, (product) => product.images, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: Product;
}
