// These enums mirror prisma/schema.prisma
// After running `npx prisma generate`, these can be imported from '@prisma/client'

export enum Role {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum SaleType {
  SALE = 'SALE',
  RETURN = 'RETURN',
  EXCHANGE = 'EXCHANGE',
}

export enum SaleStatus {
  COMPLETED = 'COMPLETED',
  VOIDED = 'VOIDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  QR = 'QR',
}

export enum ShiftStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum StockMovementType {
  STOCK_IN = 'STOCK_IN',
  SALE = 'SALE',
  RETURN = 'RETURN',
  EXCHANGE_IN = 'EXCHANGE_IN',
  EXCHANGE_OUT = 'EXCHANGE_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}
