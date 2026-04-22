import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { ImageService } from './image.service';
import { ImageResolver } from './image.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  providers: [ImageService, ImageResolver],
  exports: [ImageService],
})
export class ImageModule {}
