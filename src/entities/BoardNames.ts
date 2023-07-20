import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class boardName {

    @PrimaryGeneratedColumn('uuid')
    userId: string;

    @Column({})
    sessionName: string;

}
