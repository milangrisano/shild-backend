import { IsArray, IsAscii, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

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

    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

}
