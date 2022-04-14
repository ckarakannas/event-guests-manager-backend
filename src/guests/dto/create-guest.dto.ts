import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GuestRSVPEnum } from '../entities/guest-rsvp.enum';

export class CreateGuestDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
  
  @IsEmail()
  email?: string;
      
  @IsEnum(GuestRSVPEnum)
  rsvpStatus?: GuestRSVPEnum;
}
