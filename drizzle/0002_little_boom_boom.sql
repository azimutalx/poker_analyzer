CREATE TABLE `subscriptionPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`slug` varchar(64) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'BRL',
	`interval` enum('month','year') DEFAULT 'month',
	`handsPerMonth` int DEFAULT 100,
	`analysisPerMonth` int DEFAULT 1,
	`replayAccess` boolean DEFAULT true,
	`gtoRangesAccess` boolean DEFAULT false,
	`exportAccess` boolean DEFAULT false,
	`prioritySupport` boolean DEFAULT false,
	`description` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptionPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptionPlans_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `userCredits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`handsImported` int DEFAULT 0,
	`handsLimit` int DEFAULT 50,
	`analysisUsed` int DEFAULT 0,
	`analysisLimit` int DEFAULT 1,
	`replaysUsed` int DEFAULT 0,
	`replaysLimit` int DEFAULT 10,
	`lastResetAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userCredits_id` PRIMARY KEY(`id`),
	CONSTRAINT `userCredits_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `userSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`status` enum('active','canceled','expired','trial') DEFAULT 'trial',
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `hands` ADD `gameFormat` enum('cash','tournament','sng','mtt') DEFAULT 'cash';--> statement-breakpoint
ALTER TABLE `hands` ADD `tournamentId` varchar(64);--> statement-breakpoint
ALTER TABLE `hands` ADD `tournamentName` varchar(255);--> statement-breakpoint
ALTER TABLE `hands` ADD `tournamentBuyIn` varchar(64);