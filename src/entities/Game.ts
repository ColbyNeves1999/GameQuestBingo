import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Game {

    @PrimaryGeneratedColumn('uuid')
    gameId: string;

    @Column()
    title: string;

}
