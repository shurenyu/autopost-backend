import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feeds } from './entities/feeds.entity';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';
import { Posts } from './entities/posts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feeds, Posts])
  ],
  controllers: [FeedsController],
  providers: [FeedsService]
})
export class FeedsModule {}
