import { IsEnum, IsNotEmpty } from 'class-validator';
import { GuestRSVPEnum } from '../entities/guest-rsvp.enum';

export class RSVPDto {
  @IsNotEmpty()
  @IsEnum(GuestRSVPEnum)
  rsvpStatus?: GuestRSVPEnum;
}
