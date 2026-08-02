import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { SEARCH_SERVICE } from './search.service';
import { PrismaSearchAdapter } from './prisma-search.adapter';

@Module({
  providers: [
    PrismaService,
    { provide: SEARCH_SERVICE, useClass: PrismaSearchAdapter },
  ],
  exports: [SEARCH_SERVICE],
})
export class SearchModule {}
