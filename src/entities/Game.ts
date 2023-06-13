import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';

import { Platform } from './Platforms';
import { Objective } from './UserObjectiveList';

@Entity()
export class Game {

    @PrimaryGeneratedColumn('uuid')
    gameId: string;

    @Column({ default: null })
    title: string;

    @Column({ default: null })
    rating: string;

    @Column({ default: null })
    console: string;

    @Column({ default: null })
    steamID: string;

    @OneToMany(() => Platform, (platform) => platform.game, { cascade: ['insert', 'update'] })
    platform: Relation<Platform>[];

    @OneToMany(() => Objective, (objective) => objective.game, { cascade: ['insert', 'update'] })
    objectives: Relation<Objective>[];

}
