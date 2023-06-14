import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';

import { Game } from './Game';

@Entity()
export class SteamAchieve {

    @PrimaryGeneratedColumn('uuid')
    achievementID: string;

    @Column({})
    achievement: string;

    @ManyToOne(() => Game, (game) => game.steamachieve, { cascade: ['insert', 'update'] })
    game: Relation<Game>;

}