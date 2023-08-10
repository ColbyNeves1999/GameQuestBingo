import { Entity, PrimaryGeneratedColumn, Column, Relation, OneToMany } from 'typeorm';

import { Objective } from './UserObjectiveList';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    passwordHash: string;

    @Column({ default: null })
    IGDBCode: string;

    @Column({ default: null })
    psUsername: string;

    @Column({ default: null })
    playstationCode: string;

    @Column({ default: null })
    playstationRefreshCode: string;

    @Column({ default: null })
    xboxUsername: string;

    @Column({ default: null })
    xboxCode: string;

    @Column({ default: null })
    xboxRefreshCode: string;

    @Column({ default: null })
    nintendoCode: string;

    @Column({ default: null })
    steamUsername: string;

    @Column({ default: null })
    pcCode: string;

    @Column({ default: null })
    pcRefreshCode: string;

    @Column({ default: null })
    refreshCode: string;

    @Column({ default: false })
    admin: boolean;

    @OneToMany(() => Objective, (objective) => objective.game, { cascade: ['insert', 'update'] })
    objectives: Relation<Objective>[];

}
