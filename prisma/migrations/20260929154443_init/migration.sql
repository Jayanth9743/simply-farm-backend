-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RefreshTokenStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK_ACCOUNT', 'UPI');

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('PLATFORM_DELIVERY', 'BUYER_PICKUP');

-- CreateEnum
CREATE TYPE "ProduceOrderStatus" AS ENUM ('PENDING_SELLER_APPROVAL', 'APPROVED', 'PAYMENT_PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InventoryReservationStatus" AS ENUM ('RESERVED', 'CONFIRMED', 'RELEASED');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('VEHICLE', 'MACHINE');

-- CreateEnum
CREATE TYPE "RentalFulfillmentType" AS ENUM ('PLATFORM_DELIVERY', 'RENTER_PICKUP');

-- CreateEnum
CREATE TYPE "RentalBookingStatus" AS ENUM ('PENDING_OWNER_APPROVAL', 'APPROVED', 'PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RentalOption" AS ENUM ('HOURLY', 'DAILY');

-- CreateEnum
CREATE TYPE "PaymentOrderType" AS ENUM ('PRODUCE', 'RENTAL');

-- CreateEnum
CREATE TYPE "PaymentOrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('UPI', 'CARD', 'NET_BANKING', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('CALCULATED', 'SETTLED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ConversationContextType" AS ENUM ('PRODUCE_ORDER', 'RENTAL_BOOKING', 'GENERAL');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_PLACED', 'ORDER_APPROVED', 'ORDER_REJECTED', 'ORDER_CANCELLED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'RENTAL_REQUESTED', 'RENTAL_APPROVED', 'RENTAL_REJECTED', 'RENTAL_CANCELLED', 'PAYOUT_SUCCESS', 'REFUND_SUCCESS', 'MESSAGE_RECEIVED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "status" "RefreshTokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "user_agent" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "address_line_1" VARCHAR(255) NOT NULL,
    "address_line_2" VARCHAR(255),
    "village" VARCHAR(100),
    "taluk" VARCHAR(100),
    "district" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(10) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "payout_method" "PayoutMethod" NOT NULL,
    "account_holder_name" VARCHAR(150),
    "account_number" VARCHAR(50),
    "ifsc_code" VARCHAR(20),
    "upi_id" VARCHAR(255),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payout_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produce_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produce_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produce_listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seller_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "location_address_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "cancellation_window_hours" INTEGER NOT NULL DEFAULT 2,
    "cancellation_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produce_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produce_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "produce_listing_id" UUID NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "produce_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produce_inventory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "produce_listing_id" UUID NOT NULL,
    "total_quantity" DECIMAL(12,3) NOT NULL,
    "available_quantity" DECIMAL(12,3) NOT NULL,
    "reserved_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produce_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produce_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "produce_listing_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "payment_order_id" UUID NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "delivery_type" "DeliveryType" NOT NULL,
    "delivery_address_snapshot" JSONB,
    "delivery_charge" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "requested_delivery_at" TIMESTAMP(3),
    "estimated_delivery_at" TIMESTAMP(3),
    "cancellation_deadline" TIMESTAMP(3) NOT NULL,
    "cancellation_fee_percentage" DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    "status" "ProduceOrderStatus" NOT NULL DEFAULT 'PENDING_SELLER_APPROVAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produce_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_reservations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "produce_inventory_id" UUID NOT NULL,
    "produce_order_id" UUID NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "status" "InventoryReservationStatus" NOT NULL DEFAULT 'RESERVED',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),

    CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "location_address_id" UUID NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "registration_number" VARCHAR(50),
    "description" TEXT,
    "hourly_price" DECIMAL(12,2),
    "daily_price" DECIMAL(12,2),
    "min_rental_minutes" INTEGER NOT NULL,
    "max_rental_minutes" INTEGER NOT NULL,
    "handover_start_time" TIME,
    "handover_end_time" TIME,
    "advance_percentage" DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_listing_id" UUID NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "equipment_id" UUID NOT NULL,
    "attachment_id" UUID NOT NULL,
    "hourly_price" DECIMAL(12,2),
    "daily_price" DECIMAL(12,2),
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachment_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attachment_listing_id" UUID NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachment_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "renter_id" UUID NOT NULL,
    "owner_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "payment_order_id" UUID NOT NULL,
    "rental_option" "RentalOption" NOT NULL,
    "rental_fulfillment_type" "RentalFulfillmentType" NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "base_unit_price" DECIMAL(12,2) NOT NULL,
    "base_amount" DECIMAL(14,2) NOT NULL,
    "operator_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL,
    "pickup_address_snapshot" JSONB NOT NULL,
    "return_address_snapshot" JSONB NOT NULL,
    "owner_response_deadline" TIMESTAMP(3) NOT NULL,
    "payment_deadline" TIMESTAMP(3),
    "status" "RentalBookingStatus" NOT NULL DEFAULT 'PENDING_OWNER_APPROVAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_booking_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rental_booking_id" UUID NOT NULL,
    "equipment_attachment_id" UUID NOT NULL,
    "attachment_name_snapshot" VARCHAR(100) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "total_price" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_booking_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_type" "PaymentOrderType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "status" "PaymentOrderStatus" NOT NULL DEFAULT 'PENDING',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_order_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "transaction_reference" VARCHAR(150),
    "failure_reason" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL,
    "base_amount" DECIMAL(14,2) NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'CALCULATED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL,
    "recipient_id" UUID NOT NULL,
    "payout_account_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "provider_reference" VARCHAR(150),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "next_retry_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "provider_reference" VARCHAR(150),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_config" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rate" DECIMAL(5,2) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "context_type" "ConversationContextType" NOT NULL,
    "context_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_read_at" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" VARCHAR(100) NOT NULL,
    "aggregate_type" VARCHAR(50) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 5,
    "locked_by" VARCHAR(100),
    "locked_at" TIMESTAMP(3),
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "outbox_event_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "sent_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_status_idx" ON "refresh_tokens"("user_id", "status");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "addresses_user_id_idx" ON "addresses"("user_id");

-- CreateIndex
CREATE INDEX "payout_accounts_user_id_idx" ON "payout_accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "produce_categories_name_key" ON "produce_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_name_key" ON "units"("name");

-- CreateIndex
CREATE UNIQUE INDEX "units_symbol_key" ON "units"("symbol");

-- CreateIndex
CREATE INDEX "produce_listings_seller_id_idx" ON "produce_listings"("seller_id");

-- CreateIndex
CREATE INDEX "produce_listings_category_id_idx" ON "produce_listings"("category_id");

-- CreateIndex
CREATE INDEX "produce_listings_unit_id_idx" ON "produce_listings"("unit_id");

-- CreateIndex
CREATE INDEX "produce_listings_location_address_id_idx" ON "produce_listings"("location_address_id");

-- CreateIndex
CREATE INDEX "produce_listings_status_idx" ON "produce_listings"("status");

-- CreateIndex
CREATE INDEX "produce_listings_seller_id_status_idx" ON "produce_listings"("seller_id", "status");

-- CreateIndex
CREATE INDEX "produce_listings_category_id_status_idx" ON "produce_listings"("category_id", "status");

-- CreateIndex
CREATE INDEX "produce_images_produce_listing_id_idx" ON "produce_images"("produce_listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "produce_inventory_produce_listing_id_key" ON "produce_inventory"("produce_listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "produce_orders_payment_order_id_key" ON "produce_orders"("payment_order_id");

-- CreateIndex
CREATE INDEX "produce_orders_buyer_id_idx" ON "produce_orders"("buyer_id");

-- CreateIndex
CREATE INDEX "produce_orders_seller_id_idx" ON "produce_orders"("seller_id");

-- CreateIndex
CREATE INDEX "produce_orders_produce_listing_id_idx" ON "produce_orders"("produce_listing_id");

-- CreateIndex
CREATE INDEX "produce_orders_status_idx" ON "produce_orders"("status");

-- CreateIndex
CREATE INDEX "produce_orders_requested_delivery_at_idx" ON "produce_orders"("requested_delivery_at");

-- CreateIndex
CREATE INDEX "produce_orders_seller_id_status_idx" ON "produce_orders"("seller_id", "status");

-- CreateIndex
CREATE INDEX "produce_orders_buyer_id_status_idx" ON "produce_orders"("buyer_id", "status");

-- CreateIndex
CREATE INDEX "produce_orders_produce_listing_id_status_idx" ON "produce_orders"("produce_listing_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_reservations_produce_order_id_key" ON "inventory_reservations"("produce_order_id");

-- CreateIndex
CREATE INDEX "inventory_reservations_produce_inventory_id_idx" ON "inventory_reservations"("produce_inventory_id");

-- CreateIndex
CREATE INDEX "inventory_reservations_status_idx" ON "inventory_reservations"("status");

-- CreateIndex
CREATE INDEX "inventory_reservations_expires_at_idx" ON "inventory_reservations"("expires_at");

-- CreateIndex
CREATE INDEX "inventory_reservations_produce_inventory_id_status_idx" ON "inventory_reservations"("produce_inventory_id", "status");

-- CreateIndex
CREATE INDEX "inventory_reservations_status_expires_at_idx" ON "inventory_reservations"("status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_categories_name_key" ON "equipment_categories"("name");

-- CreateIndex
CREATE INDEX "equipment_owner_id_idx" ON "equipment"("owner_id");

-- CreateIndex
CREATE INDEX "equipment_category_id_idx" ON "equipment"("category_id");

-- CreateIndex
CREATE INDEX "equipment_location_address_id_idx" ON "equipment"("location_address_id");

-- CreateIndex
CREATE INDEX "equipment_type_idx" ON "equipment"("type");

-- CreateIndex
CREATE INDEX "equipment_status_idx" ON "equipment"("status");

-- CreateIndex
CREATE INDEX "equipment_owner_id_status_idx" ON "equipment"("owner_id", "status");

-- CreateIndex
CREATE INDEX "equipment_category_id_status_idx" ON "equipment"("category_id", "status");

-- CreateIndex
CREATE INDEX "equipment_images_equipment_listing_id_idx" ON "equipment_images"("equipment_listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "attachments_name_key" ON "attachments"("name");

-- CreateIndex
CREATE INDEX "equipment_attachments_equipment_id_idx" ON "equipment_attachments"("equipment_id");

-- CreateIndex
CREATE INDEX "equipment_attachments_attachment_id_idx" ON "equipment_attachments"("attachment_id");

-- CreateIndex
CREATE INDEX "equipment_attachments_status_idx" ON "equipment_attachments"("status");

-- CreateIndex
CREATE INDEX "equipment_attachments_equipment_id_status_idx" ON "equipment_attachments"("equipment_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_attachments_equipment_id_attachment_id_key" ON "equipment_attachments"("equipment_id", "attachment_id");

-- CreateIndex
CREATE INDEX "attachment_images_attachment_listing_id_idx" ON "attachment_images"("attachment_listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "rental_bookings_payment_order_id_key" ON "rental_bookings"("payment_order_id");

-- CreateIndex
CREATE INDEX "rental_bookings_renter_id_idx" ON "rental_bookings"("renter_id");

-- CreateIndex
CREATE INDEX "rental_bookings_owner_id_idx" ON "rental_bookings"("owner_id");

-- CreateIndex
CREATE INDEX "rental_bookings_equipment_id_idx" ON "rental_bookings"("equipment_id");

-- CreateIndex
CREATE INDEX "rental_bookings_rental_option_idx" ON "rental_bookings"("rental_option");

-- CreateIndex
CREATE INDEX "rental_bookings_status_idx" ON "rental_bookings"("status");

-- CreateIndex
CREATE INDEX "rental_bookings_start_at_idx" ON "rental_bookings"("start_at");

-- CreateIndex
CREATE INDEX "rental_bookings_end_at_idx" ON "rental_bookings"("end_at");

-- CreateIndex
CREATE INDEX "rental_bookings_equipment_id_status_idx" ON "rental_bookings"("equipment_id", "status");

-- CreateIndex
CREATE INDEX "rental_bookings_renter_id_status_idx" ON "rental_bookings"("renter_id", "status");

-- CreateIndex
CREATE INDEX "rental_bookings_owner_id_status_idx" ON "rental_bookings"("owner_id", "status");

-- CreateIndex
CREATE INDEX "rental_booking_attachments_rental_booking_id_idx" ON "rental_booking_attachments"("rental_booking_id");

-- CreateIndex
CREATE INDEX "rental_booking_attachments_equipment_attachment_id_idx" ON "rental_booking_attachments"("equipment_attachment_id");

-- CreateIndex
CREATE UNIQUE INDEX "rental_booking_attachments_rental_booking_id_equipment_atta_key" ON "rental_booking_attachments"("rental_booking_id", "equipment_attachment_id");

-- CreateIndex
CREATE INDEX "payment_orders_status_idx" ON "payment_orders"("status");

-- CreateIndex
CREATE INDEX "payment_orders_expires_at_idx" ON "payment_orders"("expires_at");

-- CreateIndex
CREATE INDEX "payment_orders_order_type_idx" ON "payment_orders"("order_type");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transaction_reference_key" ON "payments"("transaction_reference");

-- CreateIndex
CREATE INDEX "payments_payment_order_id_idx" ON "payments"("payment_order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_payment_id_key" ON "commissions"("payment_id");

-- CreateIndex
CREATE INDEX "commissions_payment_id_idx" ON "commissions"("payment_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_provider_reference_key" ON "payouts"("provider_reference");

-- CreateIndex
CREATE INDEX "payouts_payment_id_idx" ON "payouts"("payment_id");

-- CreateIndex
CREATE INDEX "payouts_recipient_id_idx" ON "payouts"("recipient_id");

-- CreateIndex
CREATE INDEX "payouts_payout_account_id_idx" ON "payouts"("payout_account_id");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_status_next_retry_at_idx" ON "payouts"("status", "next_retry_at");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_provider_reference_key" ON "refunds"("provider_reference");

-- CreateIndex
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "commission_config_effective_from_idx" ON "commission_config"("effective_from");

-- CreateIndex
CREATE INDEX "conversations_context_type_idx" ON "conversations"("context_type");

-- CreateIndex
CREATE INDEX "conversations_context_type_context_id_idx" ON "conversations"("context_type", "context_id");

-- CreateIndex
CREATE INDEX "conversation_participants_conversation_id_idx" ON "conversation_participants"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_event_type_idx" ON "outbox_events"("event_type");

-- CreateIndex
CREATE INDEX "outbox_events_status_available_at_idx" ON "outbox_events"("status", "available_at");

-- CreateIndex
CREATE INDEX "outbox_events_aggregate_type_aggregate_id_idx" ON "outbox_events"("aggregate_type", "aggregate_id");

-- CreateIndex
CREATE INDEX "outbox_events_locked_at_idx" ON "outbox_events"("locked_at");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_outbox_event_id_key" ON "notifications"("outbox_event_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_accounts" ADD CONSTRAINT "payout_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "produce_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_listings" ADD CONSTRAINT "produce_listings_location_address_id_fkey" FOREIGN KEY ("location_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_images" ADD CONSTRAINT "produce_images_produce_listing_id_fkey" FOREIGN KEY ("produce_listing_id") REFERENCES "produce_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_inventory" ADD CONSTRAINT "produce_inventory_produce_listing_id_fkey" FOREIGN KEY ("produce_listing_id") REFERENCES "produce_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_produce_listing_id_fkey" FOREIGN KEY ("produce_listing_id") REFERENCES "produce_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produce_orders" ADD CONSTRAINT "produce_orders_payment_order_id_fkey" FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_produce_inventory_id_fkey" FOREIGN KEY ("produce_inventory_id") REFERENCES "produce_inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_produce_order_id_fkey" FOREIGN KEY ("produce_order_id") REFERENCES "produce_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "equipment_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_location_address_id_fkey" FOREIGN KEY ("location_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_images" ADD CONSTRAINT "equipment_images_equipment_listing_id_fkey" FOREIGN KEY ("equipment_listing_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_attachments" ADD CONSTRAINT "equipment_attachments_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_attachments" ADD CONSTRAINT "equipment_attachments_attachment_id_fkey" FOREIGN KEY ("attachment_id") REFERENCES "attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachment_images" ADD CONSTRAINT "attachment_images_attachment_listing_id_fkey" FOREIGN KEY ("attachment_listing_id") REFERENCES "equipment_attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_bookings" ADD CONSTRAINT "rental_bookings_renter_id_fkey" FOREIGN KEY ("renter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_bookings" ADD CONSTRAINT "rental_bookings_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_bookings" ADD CONSTRAINT "rental_bookings_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_bookings" ADD CONSTRAINT "rental_bookings_payment_order_id_fkey" FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_booking_attachments" ADD CONSTRAINT "rental_booking_attachments_rental_booking_id_fkey" FOREIGN KEY ("rental_booking_id") REFERENCES "rental_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_booking_attachments" ADD CONSTRAINT "rental_booking_attachments_equipment_attachment_id_fkey" FOREIGN KEY ("equipment_attachment_id") REFERENCES "equipment_attachments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_order_id_fkey" FOREIGN KEY ("payment_order_id") REFERENCES "payment_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_payout_account_id_fkey" FOREIGN KEY ("payout_account_id") REFERENCES "payout_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_config" ADD CONSTRAINT "commission_config_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_outbox_event_id_fkey" FOREIGN KEY ("outbox_event_id") REFERENCES "outbox_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- constraints
CREATE UNIQUE INDEX one_success_per_payment_order ON payments (payment_order_id) WHERE status = 'SUCCESS';

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE rental_bookings
ADD CONSTRAINT no_overlapping_bookings
EXCLUDE USING gist (
    equipment_id WITH =,
    tsrange(start_at, end_at, '[)') WITH &&
)
WHERE (
    status IN (
        'APPROVED',
        'PAYMENT_PENDING',
        'CONFIRMED',
        'ACTIVE'
    )
);

ALTER TABLE equipment ADD CONSTRAINT vehicle_requires_registration CHECK (type != 'VEHICLE' OR registration_number IS NOT NULL);

ALTER TABLE equipment ADD CONSTRAINT at_least_one_price CHECK (hourly_price IS NOT NULL OR daily_price IS NOT NULL);