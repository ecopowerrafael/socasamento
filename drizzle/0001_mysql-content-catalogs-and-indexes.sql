CREATE TABLE `inspirations` (
	`id` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`image_url` text NOT NULL,
	`likes_count` int DEFAULT 0,
	`status` varchar(20) DEFAULT 'active',
	`sort_order` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inspirations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photo_locations` (
	`id` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100),
	`city` varchar(150),
	`state` varchar(2),
	`cover_image` text,
	`ideal_time` varchar(255),
	`need_authorization` boolean DEFAULT false,
	`fee_info` text,
	`description` text,
	`address` text,
	`status` varchar(20) DEFAULT 'active',
	`sort_order` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photo_locations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `event_reminders` ADD CONSTRAINT `uq_event_reminder` UNIQUE(`event_id`,`reminder_type`,`remind_at`);--> statement-breakpoint
ALTER TABLE `inspiration_favorites` ADD CONSTRAINT `uq_inspiration_favorite` UNIQUE(`user_id`,`inspiration_id`);--> statement-breakpoint
ALTER TABLE `notification_automation_rules` ADD CONSTRAINT `uq_automation_rule` UNIQUE(`event_type`,`user_type`);--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `uq_notification_preference` UNIQUE(`user_id`,`event_type`);--> statement-breakpoint
ALTER TABLE `photo_location_favorites` ADD CONSTRAINT `uq_photo_location_favorite` UNIQUE(`user_id`,`location_id`);--> statement-breakpoint
ALTER TABLE `photographer_favorites` ADD CONSTRAINT `uq_photographer_favorite` UNIQUE(`user_id`,`photographer_id`);--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `uq_push_user_endpoint` UNIQUE(`user_id`,`endpoint_hash`);--> statement-breakpoint
CREATE INDEX `idx_inspirations_status_order` ON `inspirations` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_photo_locations_status_order` ON `photo_locations` (`status`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_reminder_worker` ON `event_reminders` (`status`,`remind_at`);--> statement-breakpoint
CREATE INDEX `idx_delivery_worker` ON `notification_delivery_queue` (`status`,`scheduled_at`);--> statement-breakpoint
CREATE INDEX `idx_push_active_user` ON `push_subscriptions` (`is_active`,`user_id`);