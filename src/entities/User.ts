import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    passwordHash: string;

    @Column({ default: null })
    gameDataCode: string;

    @Column({ default: null })
    playstationCode: string;

    @Column({ default: null })
    xboxCode: string;

    @Column({ default: null })
    nintendoCode: string;

    @Column({ default: null })
    pcCode: string;

    @Column({ default: null })
    refreshCode: string;

}
