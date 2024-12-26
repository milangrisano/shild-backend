import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";



@Entity()
export class ProductImage {

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        () => Product,
        ( product ) => product.images
    )
    product: Product;

}