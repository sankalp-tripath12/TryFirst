import { IsString, MinLength, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class VariantInput {
  @IsString()
  size!: string;

  @IsString()
  color!: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  description!: string;

  @IsString()
  category!: string;

  @IsString()
  shopId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInput)
  variants!: VariantInput[];
}
