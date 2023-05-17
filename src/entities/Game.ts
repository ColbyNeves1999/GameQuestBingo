import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Relation } from 'typeorm';

import { Platform } from './Platforms';

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

    @OneToMany(() => Platform, (platform) => platform.game, { cascade: ['insert', 'update'] })
    platform: Relation<Platform>[];

}
