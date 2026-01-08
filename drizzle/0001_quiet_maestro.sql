CREATE TABLE `analysisReports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportType` varchar(64) NOT NULL,
	`periodStart` timestamp,
	`periodEnd` timestamp,
	`handsAnalyzed` int DEFAULT 0,
	`summary` text,
	`strengths` json,
	`weaknesses` json,
	`recommendations` json,
	`s3BackupUrl` varchar(512),
	`pdfReportUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysisReports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gtoRanges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`position` enum('BTN','CO','MP','UTG','BB','SB') NOT NULL,
	`situation` varchar(64) NOT NULL,
	`rangeData` json NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gtoRanges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `handTagRelations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`handId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `handTagRelations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `handTags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(64) NOT NULL,
	`color` varchar(7) DEFAULT '#ff00ff',
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `handTags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hands` (
	`id` int AUTO_INCREMENT NOT NULL,
	`odlId` varchar(64),
	`userId` int NOT NULL,
	`sessionId` int,
	`site` varchar(64) NOT NULL,
	`gameType` varchar(64) NOT NULL,
	`stakes` varchar(64),
	`tableName` varchar(255),
	`handNumber` varchar(64),
	`playedAt` timestamp,
	`heroPosition` enum('BTN','CO','MP','UTG','BB','SB'),
	`heroCards` varchar(10),
	`boardCards` varchar(20),
	`potSize` decimal(12,2),
	`heroWon` decimal(12,2),
	`heroInvested` decimal(12,2),
	`netResult` decimal(12,2),
	`preflopAction` varchar(64),
	`flopAction` varchar(64),
	`turnAction` varchar(64),
	`riverAction` varchar(64),
	`wentToShowdown` boolean DEFAULT false,
	`wonAtShowdown` boolean DEFAULT false,
	`rawHistory` text,
	`parsedData` json,
	`gtoScore` int,
	`mistakes` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hands_id` PRIMARY KEY(`id`),
	CONSTRAINT `hands_odlId_unique` UNIQUE(`odlId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`isRead` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `opponents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`playerName` varchar(255) NOT NULL,
	`site` varchar(64),
	`handsPlayed` int DEFAULT 0,
	`vpip` decimal(5,2) DEFAULT '0',
	`pfr` decimal(5,2) DEFAULT '0',
	`threeBet` decimal(5,2) DEFAULT '0',
	`aggFreq` decimal(5,2) DEFAULT '0',
	`playerType` varchar(64),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `opponents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `positionStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`position` enum('BTN','CO','MP','UTG','BB','SB') NOT NULL,
	`handsPlayed` int DEFAULT 0,
	`vpip` decimal(5,2) DEFAULT '0',
	`pfr` decimal(5,2) DEFAULT '0',
	`threeBet` decimal(5,2) DEFAULT '0',
	`foldToThreeBet` decimal(5,2) DEFAULT '0',
	`winrate` decimal(8,2) DEFAULT '0',
	`netProfit` decimal(12,2) DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `positionStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255),
	`site` varchar(64),
	`gameType` varchar(64),
	`stakes` varchar(64),
	`startTime` timestamp,
	`endTime` timestamp,
	`handsPlayed` int DEFAULT 0,
	`netProfit` decimal(12,2) DEFAULT '0',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalHands` int DEFAULT 0,
	`totalSessions` int DEFAULT 0,
	`totalProfit` decimal(12,2) DEFAULT '0',
	`vpip` decimal(5,2) DEFAULT '0',
	`pfr` decimal(5,2) DEFAULT '0',
	`threeBet` decimal(5,2) DEFAULT '0',
	`foldToThreeBet` decimal(5,2) DEFAULT '0',
	`cbet` decimal(5,2) DEFAULT '0',
	`foldToCbet` decimal(5,2) DEFAULT '0',
	`wtsd` decimal(5,2) DEFAULT '0',
	`wsd` decimal(5,2) DEFAULT '0',
	`aggFreq` decimal(5,2) DEFAULT '0',
	`aggFactor` decimal(5,2) DEFAULT '0',
	`bbPer100` decimal(8,2) DEFAULT '0',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userStats_id` PRIMARY KEY(`id`)
);
