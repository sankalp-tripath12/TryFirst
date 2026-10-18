import { IsBoolean, IsInt, Min, Max } from 'class-validator';

export class CreateQualityCheckDto {
  @IsBoolean()
  sizeMatchesLabel!: boolean;

  @IsBoolean()
  noDefects!: boolean;

  @IsBoolean()
  colorAsListed!: boolean;

  @IsInt() @Min(1) @Max(5)
  fabric!: number;

  @IsInt() @Min(1) @Max(5)
  fit!: number;

  @IsInt() @Min(1) @Max(5)
  appearance!: number;

  @IsInt() @Min(1) @Max(5)
  value!: number;
}
