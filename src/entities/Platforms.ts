import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';

import { Game } from './Game';

@Entity()
export class Platform {

    @PrimaryGeneratedColumn('uuid')
    platformID: string;

    @Column({})
    platform: string;

    @ManyToOne(() => Game, (game) => game.platform, { cascade: ['insert', 'update'] })
    game: Relation<Game>;

}