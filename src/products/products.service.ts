import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid'
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ){}
  
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( images => this.productImagesRepository.create({ url: images }) )
      });
      await this.productRepository.save(product);
      return {...product, images};
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  async findAll(paginationDto) {
    const { limit = 10, offset = 0} = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    })
    return products.map( ({ images, ...productRest}) => ({
      ...productRest,
      images: images.map( img => img.url )
    }))
  }

  async findOne(term: string) {
    let product: Product;
    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('LOWER(title) =:title', {
          title: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }
    if( !product)
      throw new NotFoundException(`Product with ${term} not found`)
    return product;
  }

  //? Nota: Metodo para aplanar las imagenes
  async findOnePlain( term: string ){
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( image => image.url )
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdateDetails } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdateDetails });
    if( !product ) throw new NotFoundException(`Product with id: ${ id } not `);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete( ProductImage, { product: { id }})
        product.images = images.map(image => this.productImagesRepository.create({url: image}))
      } else {

      }
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExeptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove( product );
  }

  private handleDBExeptions( error: any ){
    if( error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check server log');
  }
}
