import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateImageInput {
  @Field()
  url: string;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => Int, { nullable: true })
  productId?: number;
}

@InputType()
export class UpdateImageInput {
  @Field({ nullable: true })
  url?: string;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => Int, { nullable: true })
  productId?: number;
}
