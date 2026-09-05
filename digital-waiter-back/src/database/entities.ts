import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

export type EstadoMesa = 'available' | 'occupied' | 'preparing' | 'ready' | 'payment';
export type EstadoPedido = 'new' | 'preparing' | 'ready' | 'payment' | 'paid';

@Entity('restaurantes')
export class Restaurante {
  @PrimaryGeneratedColumn() id: number;
  @Column() nombre: string;
  @Column({ unique: true }) slug: string;
  @Column({ default: '' }) ciudad: string;
  @Column({ default: '' }) direccion: string;
  @Column({ default: '' }) telefono: string;
  @Column({ default: true }) activo: boolean;
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) usuario: string;
  @Column() nombre: string;
  @Column() passwordHash: string;
  @Column({ default: 'Mesero' }) rol: string;
  @Column({ default: true }) activo: boolean;
  @Column({ nullable: true }) restauranteId?: number;
}

@Entity('mesas')
@Index(['restauranteId', 'numero'], { unique: true })
export class Mesa {
  @PrimaryGeneratedColumn() id: number;
  @Column() numero: number;
  @Column({ default: 4 }) capacidad: number;
  @Column({ default: 'available' }) estado: EstadoMesa;
  @OneToMany(() => Pedido, pedido => pedido.mesa) pedidos: Pedido[];
  @Column({ nullable: true }) restauranteId?: number;
}

@Entity('categorias')
@Index(['restauranteId', 'nombre'], { unique: true })
export class Categoria {
  @PrimaryGeneratedColumn() id: number;
  @Column() nombre: string;
  @OneToMany(() => Producto, producto => producto.categoria) productos: Producto[];
  @Column({ nullable: true }) restauranteId?: number;
}

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn() id: number;
  @Column() nombre: string;
  @Column({ type: 'text', default: '' }) descripcion: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) precio: number;
  @Column({ default: true }) disponible: boolean;
  @ManyToOne(() => Categoria, categoria => categoria.productos, { eager: true }) categoria: Categoria;
  @Column({ nullable: true }) restauranteId?: number;
}

@Entity('inventario')
export class Inventario {
  @PrimaryGeneratedColumn() id: number;
  @Column() nombre: string;
  @Column() unidad: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) stockActual: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) stockMinimo: number;
  @Column({ default: '' }) categoria: string;
  @Column({ nullable: true }) restauranteId?: number;
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Mesa, mesa => mesa.pedidos, { eager: true, nullable: true }) mesa?: Mesa;
  @Column({ default: 'new' }) estado: EstadoPedido;
  @Column({ default: '' }) mesero: string;
  @Column({ default: '' }) cliente: string;
  @Column({ default: '' }) telefono: string;
  @Column({ default: 'dinein' }) modalidad: string;
  @Column({ default: '' }) codigoRetiro: string;
  @Column({ default: '' }) horaRetiro: string;
  @Column({ type: 'text', default: '' }) notas: string;
  @CreateDateColumn() creadoEn: Date;
  @OneToMany(() => DetallePedido, detalle => detalle.pedido, { cascade: true, eager: true }) detalles: DetallePedido[];
  @OneToOne(() => Pago, pago => pago.pedido) pago?: Relation<Pago>;
  @Column({ nullable: true }) restauranteId?: number;
}

@Entity('detalles_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => Pedido, pedido => pedido.detalles, { onDelete: 'CASCADE' }) pedido: Pedido;
  @ManyToOne(() => Producto, { eager: true }) producto: Producto;
  @Column({ type: 'int' }) cantidad: number;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) precioUnitario: number;
}

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn() id: number;
  @OneToOne(() => Pedido, pedido => pedido.pago, { onDelete: 'RESTRICT' })
  @JoinColumn() pedido: Relation<Pedido>;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) monto: number;
  @Column() metodo: string;
  @CreateDateColumn() pagadoEn: Date;
  @Column({ nullable: true }) restauranteId?: number;
}

export const ENTITIES = [Restaurante, Usuario, Mesa, Categoria, Producto, Inventario, Pedido, DetallePedido, Pago];
