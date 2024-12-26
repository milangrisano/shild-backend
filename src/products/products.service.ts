import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid'
import { title } from 'process';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ){}
  
  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDBExeptions(error);
    }
  }

  findAll(paginationDto) {
    const { limit = 10, offset = 0} = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      //TODO: Relaciones
    });
  }

  async findOne(term: string) {
    let product: Product;
    if ( isUUID(term) ){
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('LOWER(title) =:title', {
          title: term.toLowerCase(),
        }).getOne()
    }


    if( !product)
      throw new NotFoundException(`Product with ${term} not found`)
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    });
    if( !product ) throw new NotFoundException(`Product with id: ${ id } not `);
    try {
      await this.productRepository.save( product );
      return product;
    } catch (error) {
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
