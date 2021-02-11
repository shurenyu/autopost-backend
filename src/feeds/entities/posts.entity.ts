import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';

@Entity('posts')
export class Posts {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false
  })
  url: string;

  @Column({
    type: 'text',
    nullable: true
  })
  title: string;

  @Column({
    type: 'datetime',
    nullable: true
  })
  createdAt: string;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date().toISOString();
  }

}