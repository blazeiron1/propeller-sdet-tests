import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { CreateImageInput, UpdateImageInput } from './image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async findAll(tenantId: string, productId?: number): Promise<Image[]> {
    const where: any = { tenantId };
    if (productId) {
      where.productId = productId;
    }
    return this.imageRepository.find({ where, relations: ['product'] });
  }

  async findOne(id: number, tenantId: string): Promise<Image> {
    const image = await this.imageRepository.findOne({
      where: { id, tenantId },
      relations: ['product'],
    });

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return image;
  }

  async create(tenantId: string, input: CreateImageInput): Promise<Image> {
    const image = this.imageRepository.create({
      ...input,
      tenantId,
    });
    return this.imageRepository.save(image);
  }

  async update(
    id: number,
    tenantId: string,
    input: UpdateImageInput,
  ): Promise<Image> {
    const image = await this.findOne(id, tenantId);
    Object.assign(image, input);
    return this.imageRepository.save(image);
  }

  async delete(id: number, tenantId: string): Promise<boolean> {
    const image = await this.findOne(id, tenantId);
    await this.imageRepository.remove(image);
    return true;
  }
}
