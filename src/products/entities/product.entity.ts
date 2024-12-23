import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


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
    })
    sizes: string[];

    @Column('int',{
        default: 0,
        nullable: true,
    })
    stock: number;
}
