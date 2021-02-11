import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('feeds')
export class Feeds {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'text',
    nullable: false
  })
  url: string;

  @Column({
    type: 'integer',
    nullable: false
  })
  botId: number;

}