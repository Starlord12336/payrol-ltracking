import { IsObject } from 'class-validator';

export class SetPanelAvailabilityDto {
  @IsObject()
  availability: Record<string, string[]>; // { "YYYY-MM-DD": [ "09:00-10:00", "14:00-15:00" ] }
}
