CREATE TABLE `adminLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`action` varchar(255) NOT NULL,
	`targetType` varchar(64),
	`targetId` int,
	`details` json,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`type` enum('banner','modal','notification','toast') NOT NULL,
	`priority` enum('low','medium','high','urgent') DEFAULT 'medium',
	`targetAudience` enum('all','free','subscribed','admin') DEFAULT 'all',
	`displayLocation` varchar(64),
	`imageUrl` varchar(512),
	`ctaText` varchar(64),
	`ctaUrl` varchar(512),
	`startDate` timestamp,
	`endDate` timestamp,
	`isActive` boolean DEFAULT true,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `platformMetrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL,
	`totalUsers` int DEFAULT 0,
	`activeUsers` int DEFAULT 0,
	`newUsers` int DEFAULT 0,
	`totalSubscriptions` int DEFAULT 0,
	`activeSubscriptions` int DEFAULT 0,
	`newSubscriptions` int DEFAULT 0,
	`canceledSubscriptions` int DEFAULT 0,
	`mrr` decimal(12,2) DEFAULT '0',
	`revenue` decimal(12,2) DEFAULT '0',
	`handsImported` int DEFAULT 0,
	`analysisGenerated` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `platformMetrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotionUsage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotionId` int NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`discountApplied` decimal(10,2),
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `promotionUsage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `promotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`maxUses` int,
	`usedCount` int DEFAULT 0,
	`validFrom` timestamp,
	`validUntil` timestamp,
	`isActive` boolean DEFAULT true,
	`applicablePlans` json,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `promotions_id` PRIMARY KEY(`id`),
	CONSTRAINT `promotions_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subscriptionId` int,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`status` enum('pending','completed','failed','refunded') NOT NULL,
	`paymentMethod` varchar(64),
	`paymentProvider` varchar(64),
	`transactionId` varchar(255),
	`metadata` json,
	`promotionId` int,
	`discountApplied` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`),
	CONSTRAINT `transactions_transactionId_unique` UNIQUE(`transactionId`)
);
