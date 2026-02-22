import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Customer } from './customer.entity';
import { QuotationItem } from './quotation-item.entity';
import { Template } from './template.entity';

export enum QuotationStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quotation_number', unique: true })
  quotationNumber: string;

  @Column()
  title: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.quotations)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'enum', enum: QuotationStatus, default: QuotationStatus.DRAFT })
  status: QuotationStatus;

  @Column({ name: 'valid_until', type: 'date', nullable: true })
  validUntil: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @ManyToOne(() => Template, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: Template;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, (user) => user.quotations)
  @JoinColumn({ name: 'created_by' })
  createdByUser: User;

  @OneToMany(() => QuotationItem, (item) => item.quotation, {
    cascade: true,
    eager: true,
  })
  items: QuotationItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
