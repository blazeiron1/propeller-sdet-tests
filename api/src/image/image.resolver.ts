import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { Image } from './image.entity';
import { ImageService } from './image.service';
import { CreateImageInput, UpdateImageInput } from './image.dto';
import { TenantId } from '../common/tenant.decorator';

@Resolver(() => Image)
export class ImageResolver {
  constructor(private imageService: ImageService) {}

  @Query(() => [Image], { name: 'images' })
  async getImages(
    @TenantId() tenantId: string,
    @Args('productId', { type: () => Int, nullable: true }) productId?: number,
  ): Promise<Image[]> {
    return this.imageService.findAll(tenantId, productId);
  }

  @Query(() => Image, { name: 'image' })
  async getImage(
    @TenantId() tenantId: string,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Image> {
    return this.imageService.findOne(id, tenantId);
  }

  @Mutation(() => Image)
  async createImage(
    @TenantId() tenantId: string,
    @Args('input') input: CreateImageInput,
  ): Promise<Image> {
    return this.imageService.create(tenantId, input);
  }

  @Mutation(() => Image)
  async updateImage(
    @TenantId() tenantId: string,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateImageInput,
  ): Promise<Image> {
    return this.imageService.update(id, tenantId, input);
  }

  @Mutation(() => Boolean)
  async deleteImage(
    @TenantId() tenantId: string,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.imageService.delete(id, tenantId);
  }
}
