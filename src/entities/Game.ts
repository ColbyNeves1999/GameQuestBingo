import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Game {

    @PrimaryGeneratedColumn('uuid')
    gameId: string;

    @Column({ default: null })
    title: string;

    @Column({ default: null })
    rating: string;

}
