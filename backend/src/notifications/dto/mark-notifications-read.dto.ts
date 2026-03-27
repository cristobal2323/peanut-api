import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class MarkNotificationsReadDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  notificationIds: string[];
}
