import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PlatformList {

    @PrimaryGeneratedColumn('uuid')
    platformID: string;

    @Column({})
    platformIGDBID: string;

    @Column({})
    platformName: string;

}