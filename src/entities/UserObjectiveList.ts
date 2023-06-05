import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Relation } from 'typeorm';

import { Game } from './Game';
import { User } from './User';

//Not specifically tied to users, just user submitted objectives
@Entity()
export class Objective {

    @PrimaryGeneratedColumn('uuid')
    objectiveID: string;

    @Column({})
    objective: string;

    @ManyToOne(() => User, (user) => user.objectives, { cascade: ['insert', 'update'] })
    user: Relation<User>;

    @ManyToOne(() => Game, (game) => game.platform, { cascade: ['insert', 'update'] })
    game: Relation<Game>;

}