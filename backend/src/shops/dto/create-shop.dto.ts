import { IsString, MinLength } from 'class-validator';

export class CreateShopDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(5)
  address!: string;
}
