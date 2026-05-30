import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  student = 'STUDENT',
  moderator = 'MODERATOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ unique: true, length: 255, type: 'varchar' })
  email!: string;

  @Column({ name: 'roll_no', unique: true, nullable: true })
  rollNo?: number;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role!: Role;

  @Column({ type: 'text', nullable: true })
  profilePhotoUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
