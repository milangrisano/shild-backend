import { IsIn, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @IsString()
    @MinLength(3)
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsIn(['Grande', 'Mediana', 'Personal', '1/2 Grande', '1/2 Mediana'])
    size: string;

}
