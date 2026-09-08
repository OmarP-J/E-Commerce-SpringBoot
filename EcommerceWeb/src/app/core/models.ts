export type UserRole =
  | "ADMIN"
  | "CUSTOMER"
  | "INVENTORY_MANAGER"
  | "CUSTOMER_SUPPORT";
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}
export interface Auth {
  token: string;
  user: User;
}
export interface Category {
  id: number;
  name: string;
  description: string;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  cost?: number | null;
  categoryId: number;
  categoryName: string;
  imageUrl: string | null;
  version: number;
}
export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}
export interface Coupon {
  id: number;
  code: string;
  discountPercent: number;
  expiresOn: string;
  active: boolean;
}
export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}
export interface Cart {
  items: CartLine[];
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  couponWarning: string | null;
}
export type OrderStatus =
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export interface Order {
  id: number;
  customerName: string;
  createdAt: string;
  address: string;
  phone: string;
  status: OrderStatus;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  lines: {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
  }[];
}
export interface Analytics {
  orders: number;
  cancelledOrders: number;
  customers: number;
  products: number;
  lowStockProducts: number;
  simulatedSales: number;
  simulatedProfit: number;
  averageOrderValue: number;
  openSupportCases: number;
  refundedAmount: number;
}
export interface Address {
  id: number;
  label: string;
  recipientName: string;
  addressLine: string;
  city: string;
  phone: string;
  defaultAddress: boolean;
}
export type InventoryMovementType = "ENTRY" | "EXIT" | "ADJUSTMENT";
export interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  performedBy: string;
  type: InventoryMovementType;
  quantityDelta: number;
  previousStock: number;
  newStock: number;
  note: string;
  createdAt: string;
}
export type SupportCaseType = "RETURN" | "EXCHANGE" | "REFUND" | "COMPLAINT";
export type SupportCaseStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "RESOLVED";
export interface SupportCase {
  id: number;
  orderId: number;
  customerName: string;
  customerEmail: string;
  type: SupportCaseType;
  status: SupportCaseStatus;
  reason: string;
  resolution: string | null;
  refundAmount: number;
  handledBy: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface StoreSettings {
  storeName: string;
  lowStockThreshold: number;
  supportEmail: string;
}
export const roleLabels: Record<UserRole, string> = {
  CUSTOMER: "Cliente",
  ADMIN: "Administrador",
  INVENTORY_MANAGER: "Gestor de inventario",
  CUSTOMER_SUPPORT: "Soporte al cliente",
};
export function homeForRole(role: UserRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "INVENTORY_MANAGER") return "/inventory";
  if (role === "CUSTOMER_SUPPORT") return "/support";
  return "/catalog";
}
export const statusLabels: Record<OrderStatus, string> = {
  CONFIRMED: "Confirmado",
  PROCESSING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};
