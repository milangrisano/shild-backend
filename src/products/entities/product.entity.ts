import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./Product-images.entity";


@Entity()
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text',{
        unique: true,
    })
    title: string;

    @Column('float',{
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description:string;

    @Column('text',{
        array: true,
        default: [],
    })
    sizes: string[];

    @Column('int',{
        default: 0,
        nullable: true,
    })
    stock: number;

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager:true }
    )
    images?: ProductImage[];
}
