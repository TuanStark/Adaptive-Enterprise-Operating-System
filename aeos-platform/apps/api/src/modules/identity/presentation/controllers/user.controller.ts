import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '../decorators/current-user.decorator';
import { GetCurrentUserQuery } from '../../application/queries/get-current-user/get-current-user.query';
import { UpdateUserProfileCommand } from '../../application/commands/update-user-profile/update-user-profile.command';
import { UserResponseDto } from '../../application/dto/user-response.dto';

class UpdateProfileDto {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  timezone?: string | null;
  phone?: string | null;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  @Get('me')
  async getMe(@CurrentUser() user: any): Promise<UserResponseDto> {
    const result = await this.queryBus.execute(new GetCurrentUserQuery(user.id));

    if (result.isFail()) {
      throw result.error;
    }

    return result.value;
  }

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateUserProfileCommand(
        user.id,
        dto.firstName ?? null,
        dto.lastName ?? null,
        dto.avatarUrl ?? null,
        dto.bio ?? null,
        dto.timezone ?? null,
        dto.phone ?? null,
      )
    );

    if (result.isFail()) {
      throw result.error;
    }
  }
}
