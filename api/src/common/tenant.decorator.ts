import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const TenantId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new BadRequestException('Missing required header: x-tenant-id');
    }

    return tenantId;
  },
);