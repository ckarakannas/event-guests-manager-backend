import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { PaginationFilter } from './pagination.dto';

@Injectable()
export class ParsePaginationFilterPipe
  implements PipeTransform<object, PaginationFilter>
{
  transform(data: object, metadata: ArgumentMetadata): PaginationFilter {
    const page = parseInt(data['page'], 10);
    if (isNaN(page) || page <= 0) {
      throw new BadRequestException(
        'Page query param needs to be a positive integer.',
      );
    }
    const limit = parseInt(data['limit'], 10);

    if (isNaN(limit) || limit <= 0) {
      throw new BadRequestException(
        'Limit query param needs to be a positive integer.',
      );
    }

    return {
      limit: limit,
      page: page,
    };
  }
}
