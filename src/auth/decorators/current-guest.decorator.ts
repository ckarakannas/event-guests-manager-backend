import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Guest } from '../../guests/entities/guest.entity';

export const CurrentGuest = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): Guest => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);
