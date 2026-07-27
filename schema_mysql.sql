-- Guia Fotógrafo Casamento - schema MySQL completo
-- Gerado a partir das migrações versionadas. Não edite manualmente.

-- 0000_mysql-baseline.sql
CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`category` varchar(100),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `blog_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text,
	`category` varchar(100),
	`author` varchar(100),
	`date` varchar(50),
	`read_time` varchar(50),
	`image` text,
	`seo_keywords` json DEFAULT ('[]'),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `blog_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_articles_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `budget_simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_uid` varchar(255),
	`guest_count` int,
	`total_wedding_budget` int,
	`recommended_min` int,
	`recommended_max` int,
	`selected_services` json DEFAULT ('[]'),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `budget_simulations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parent_id` int,
	`name` varchar(255) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`short_description` text,
	`description` text,
	`icon` varchar(255),
	`image` text,
	`icon_color` varchar(50),
	`seo_title` varchar(255),
	`seo_description` text,
	`focus_keyword` varchar(150),
	`show_on_home` boolean DEFAULT false,
	`show_on_search` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `cities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`state_id` int,
	`state_uf` varchar(2) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(150) NOT NULL,
	`ibge_code` varchar(20),
	`latitude` real,
	`longitude` real,
	`image` text,
	`introductory_text` text,
	`hero_text` varchar(255),
	`seo_title` varchar(255),
	`seo_description` text,
	`focus_keyword` varchar(150),
	`show_in_navigation` boolean DEFAULT true,
	`featured` boolean DEFAULT false,
	`sort_order` int DEFAULT 0,
	`status` varchar(20) DEFAULT 'active',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `cities_id` PRIMARY KEY(`id`),
	CONSTRAINT `cities_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `click_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int,
	`click_type` varchar(50) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `click_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `couple_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`partner_name` varchar(255),
	`wedding_date` varchar(50),
	`wedding_type` varchar(100),
	`estimated_guests` int DEFAULT 100,
	`estimated_budget` decimal(12,2) DEFAULT '80000.00',
	`wedding_style` varchar(100),
	`ceremony_location` varchar(255),
	`reception_location` varchar(255),
	`state_id` int,
	`city_id` int,
	`couple_photo` text,
	`planning_progress` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `couple_profiles_id` PRIMARY KEY(`id`)
);

CREATE TABLE `email_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`notification_id` int,
	`template_id` int,
	`recipient_email` varchar(255) NOT NULL,
	`recipient_name` varchar(255),
	`subject` varchar(255) NOT NULL,
	`body_html` text,
	`body_text` text,
	`status` varchar(50) DEFAULT 'PENDING',
	`priority` varchar(20) DEFAULT 'NORMAL',
	`scheduled_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`processing_started_at` datetime,
	`sent_at` datetime,
	`failed_at` datetime,
	`attempts` int DEFAULT 0,
	`provider_message_id` varchar(255),
	`error_code` varchar(100),
	`error_message` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `event_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`user_id` int NOT NULL,
	`reminder_type` varchar(50) DEFAULT '1_DAY_BEFORE',
	`remind_at` datetime NOT NULL,
	`channels_json` json,
	`status` varchar(50) DEFAULT 'SCHEDULED',
	`sent_at` datetime,
	`cancelled_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `event_reminders_id` PRIMARY KEY(`id`)
);

CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_uid` varchar(255) NOT NULL,
	`photographer_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);

CREATE TABLE `inspiration_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`inspiration_id` varchar(100) NOT NULL,
	`title` varchar(255),
	`category` varchar(100),
	`image_url` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `inspiration_favorites_id` PRIMARY KEY(`id`)
);

CREATE TABLE `installment_simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`total_amount` decimal(12,2) NOT NULL,
	`installments` int NOT NULL,
	`installment_amount` decimal(12,2) NOT NULL,
	`interest_rate` decimal(5,2) DEFAULT '0.00',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `installment_simulations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `leads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_uid` varchar(255),
	`photographer_id` int,
	`couple_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`wedding_date` varchar(50),
	`city` varchar(100),
	`state` varchar(2),
	`venue_type` varchar(100),
	`estimated_guests` int,
	`budget_limit` int,
	`services_needed` json DEFAULT ('[]'),
	`style_preference` varchar(100),
	`photographer_ids` json DEFAULT ('[]'),
	`message` text,
	`status` varchar(50) DEFAULT 'Novo',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leads_id` PRIMARY KEY(`id`)
);

CREATE TABLE `notification_automation_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`user_type` varchar(50) DEFAULT 'ALL',
	`is_active` boolean DEFAULT true,
	`in_app_enabled` boolean DEFAULT true,
	`push_enabled` boolean DEFAULT true,
	`email_enabled` boolean DEFAULT true,
	`email_delay_minutes` int DEFAULT 0,
	`push_delay_minutes` int DEFAULT 0,
	`priority` varchar(20) DEFAULT 'NORMAL',
	`template_in_app_id` int,
	`template_push_id` int,
	`template_email_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_automation_rules_id` PRIMARY KEY(`id`)
);

CREATE TABLE `notification_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notification_id` int,
	`user_id` int,
	`channel` varchar(20) NOT NULL,
	`destination_id` varchar(255),
	`status` varchar(50) NOT NULL,
	`attempts` int DEFAULT 1,
	`sent_at` datetime,
	`delivered_at` datetime,
	`opened_at` datetime,
	`clicked_at` datetime,
	`failed_at` datetime,
	`error_code` varchar(100),
	`error_message` text,
	`metadata_json` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_deliveries_id` PRIMARY KEY(`id`)
);

CREATE TABLE `notification_delivery_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notification_id` int,
	`campaign_id` int,
	`user_id` int,
	`channel` varchar(20) NOT NULL,
	`destination_reference` text,
	`status` varchar(50) DEFAULT 'PENDING',
	`attempts` int DEFAULT 0,
	`max_attempts` int DEFAULT 5,
	`scheduled_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`processing_started_at` datetime,
	`sent_at` datetime,
	`failed_at` datetime,
	`next_retry_at` datetime,
	`error_code` varchar(100),
	`error_message` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_delivery_queue_id` PRIMARY KEY(`id`)
);

CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_type` varchar(50) DEFAULT 'PHOTOGRAPHER',
	`event_type` varchar(100) NOT NULL,
	`in_app_enabled` boolean DEFAULT true,
	`push_enabled` boolean DEFAULT true,
	`email_enabled` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);

CREATE TABLE `notification_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`user_type` varchar(50) DEFAULT 'ALL',
	`name` varchar(255) NOT NULL,
	`subject` varchar(255),
	`title` varchar(255),
	`body_html` text,
	`body_text` text,
	`action_label` varchar(100),
	`action_url_template` text,
	`is_active` boolean DEFAULT true,
	`version` int DEFAULT 1,
	`available_variables_json` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`)
);

CREATE TABLE `password_resets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` datetime NOT NULL,
	`used_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `password_resets_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_resets_token_unique` UNIQUE(`token`)
);

CREATE TABLE `payment_gateway_audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(50) NOT NULL DEFAULT 'MERCADO_PAGO',
	`environment` varchar(20),
	`action` varchar(100) NOT NULL,
	`admin_id` int,
	`admin_name` varchar(255),
	`ip_address` varchar(100),
	`details_json` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `payment_gateway_audit_logs_id` PRIMARY KEY(`id`)
);

CREATE TABLE `payment_gateway_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(50) NOT NULL DEFAULT 'MERCADO_PAGO',
	`is_enabled` boolean DEFAULT true,
	`environment` varchar(20) NOT NULL DEFAULT 'TEST',
	`test_public_key_encrypted` text,
	`test_access_token_encrypted` text,
	`test_client_id_encrypted` text,
	`test_client_secret_encrypted` text,
	`production_public_key_encrypted` text,
	`production_access_token_encrypted` text,
	`production_client_id_encrypted` text,
	`production_client_secret_encrypted` text,
	`test_webhook_secret_encrypted` text,
	`production_webhook_secret_encrypted` text,
	`webhook_path_token` varchar(100),
	`last_connection_test_at` datetime,
	`last_connection_test_status` varchar(50),
	`last_connection_test_message` text,
	`last_webhook_received_at` datetime,
	`created_by_admin_id` int,
	`updated_by_admin_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_gateway_settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `payment_provider_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(50) NOT NULL DEFAULT 'MERCADO_PAGO',
	`environment` varchar(20) NOT NULL DEFAULT 'TEST',
	`external_event_id` varchar(255),
	`external_request_id` varchar(255),
	`event_type` varchar(100),
	`action` varchar(100),
	`external_resource_id` varchar(255),
	`live_mode` boolean DEFAULT false,
	`subscription_id` int,
	`payment_id` int,
	`provider_subscription_id` varchar(255),
	`payload_json` json,
	`headers_sanitized_json` json,
	`signature_valid` boolean DEFAULT true,
	`processing_status` varchar(50) NOT NULL DEFAULT 'RECEIVED',
	`processing_attempts` int DEFAULT 0,
	`received_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`processing_started_at` datetime,
	`processed_at` datetime,
	`next_retry_at` datetime,
	`error_code` varchar(100),
	`error_message` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_provider_events_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photo_location_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`location_id` varchar(100) NOT NULL,
	`location_name` varchar(255),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photo_location_favorites_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographer_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`category_id` int NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_categories_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographer_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`photographer_id` int NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_favorites_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographer_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`type` varchar(20) NOT NULL DEFAULT 'photo',
	`url` text NOT NULL,
	`caption` varchar(255),
	`category` varchar(100) DEFAULT 'Cerimônia',
	`featured` boolean DEFAULT false,
	`thumbnail` text,
	`embed_url` text,
	`sort_order` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_media_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographer_packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`popular` boolean DEFAULT false,
	`description` text,
	`features` json DEFAULT ('[]'),
	`deliverables` json DEFAULT ('[]'),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_packages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographer_plan_periods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`subscription_id` int,
	`plan_id` int NOT NULL,
	`started_at` datetime NOT NULL,
	`ended_at` datetime,
	`end_reason` varchar(50),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_plan_periods_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographer_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`plan_id` int,
	`billing_cycle` varchar(20) DEFAULT 'MONTHLY',
	`status` varchar(30) DEFAULT 'ACTIVE',
	`source` varchar(30) DEFAULT 'SIMULATION',
	`is_complimentary` boolean DEFAULT false,
	`counts_as_revenue` boolean DEFAULT true,
	`complimentary_reason` text,
	`complimentary_approved_by` int,
	`starts_at` datetime,
	`current_period_start` datetime,
	`current_period_end` datetime,
	`next_billing_at` datetime,
	`cancel_at_period_end` boolean DEFAULT false,
	`cancel_requested_at` datetime,
	`cancelled_at` datetime,
	`expired_at` datetime,
	`suspended_at` datetime,
	`total_suspended_seconds` int DEFAULT 0,
	`reactivated_at` datetime,
	`grace_period_ends_at` datetime,
	`scheduled_plan_id` int,
	`scheduled_billing_cycle` varchar(20),
	`scheduled_change_at` datetime,
	`chargeback_alert` boolean DEFAULT false,
	`created_by_admin_id` int,
	`admin_notes` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photographer_subscriptions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photographers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`user_uid` varchar(255),
	`slug` varchar(150) NOT NULL,
	`name` varchar(255) NOT NULL,
	`studio_name` varchar(255) NOT NULL,
	`avatar` text NOT NULL,
	`cover_image` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`neighborhood` varchar(100),
	`rating` real DEFAULT 5,
	`review_count` int DEFAULT 0,
	`price_starting_from` int DEFAULT 0,
	`price_category` varchar(100) DEFAULT 'R$ 2.000 a R$ 5.000',
	`styles` json DEFAULT ('[]'),
	`deliverables` json DEFAULT ('[]'),
	`categories` json DEFAULT ('[]'),
	`badges` json DEFAULT ('[]'),
	`years_experience` int DEFAULT 0,
	`weddings_completed` int DEFAULT 0,
	`awards_count` int DEFAULT 0,
	`description` text,
	`bio_full` text,
	`phone` varchar(50),
	`whatsapp` varchar(50),
	`instagram` varchar(255),
	`website` varchar(255),
	`email` varchar(255),
	`address` text,
	`faqs` json DEFAULT ('[]'),
	`featured_in_home` boolean DEFAULT false,
	`plan` varchar(50) DEFAULT 'Gratuito',
	`status` varchar(20) DEFAULT 'approved',
	`views_count` int DEFAULT 0,
	`whatsapp_clicks` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `photographers_id` PRIMARY KEY(`id`),
	CONSTRAINT `photographers_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `photography_quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`simulation_id` int,
	`photographer_id` int NOT NULL,
	`message` text,
	`status` varchar(50) DEFAULT 'Novo',
	`sent_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`viewed_at` datetime,
	`responded_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photography_quote_requests_id` PRIMARY KEY(`id`)
);

CREATE TABLE `photography_quote_simulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`city_id` int,
	`guest_count` int,
	`wedding_type` varchar(100),
	`coverage_hours` int,
	`include_drone` boolean DEFAULT false,
	`include_album` boolean DEFAULT false,
	`include_second_photographer` boolean DEFAULT false,
	`estimated_min_price` decimal(12,2),
	`estimated_max_price` decimal(12,2),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `photography_quote_simulations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `push_campaign_recipients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaign_id` int NOT NULL,
	`user_id` int NOT NULL,
	`push_subscription_id` int,
	`status` varchar(50) DEFAULT 'PENDING',
	`sent_at` datetime,
	`delivered_at` datetime,
	`clicked_at` datetime,
	`failed_at` datetime,
	`failure_code` varchar(100),
	`failure_message` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_campaign_recipients_id` PRIMARY KEY(`id`)
);

CREATE TABLE `push_campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`image_url` text,
	`action_url` text,
	`target_type` varchar(50) DEFAULT 'ALL',
	`target_filters_json` json,
	`priority` varchar(20) DEFAULT 'NORMAL',
	`status` varchar(50) DEFAULT 'DRAFT',
	`scheduled_at` datetime,
	`started_at` datetime,
	`completed_at` datetime,
	`cancelled_at` datetime,
	`total_users` int DEFAULT 0,
	`total_devices` int DEFAULT 0,
	`total_sent` int DEFAULT 0,
	`total_delivered` int DEFAULT 0,
	`total_failed` int DEFAULT 0,
	`total_clicked` int DEFAULT 0,
	`created_by_admin_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_campaigns_id` PRIMARY KEY(`id`)
);

CREATE TABLE `push_notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`is_enabled` boolean DEFAULT true,
	`vapid_public_key` text,
	`vapid_private_key_encrypted` text,
	`vapid_subject` text DEFAULT ('mailto:contato@guiadefotografocasamento.com.br'),
	`default_icon_url` text,
	`default_badge_url` text,
	`default_click_url` text,
	`max_daily_manual_sends` int DEFAULT 10,
	`quiet_hours_enabled` boolean DEFAULT false,
	`quiet_hours_start` varchar(10) DEFAULT '22:00',
	`quiet_hours_end` varchar(10) DEFAULT '08:00',
	`timezone` varchar(100) DEFAULT 'America/Sao_Paulo',
	`last_test_at` datetime,
	`last_test_status` varchar(50),
	`last_test_message` text,
	`created_by_admin_id` int,
	`updated_by_admin_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_notification_settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`user_type` varchar(50) NOT NULL DEFAULT 'PHOTOGRAPHER',
	`endpoint` text NOT NULL,
	`endpoint_hash` varchar(255) NOT NULL,
	`p256dh_key` text NOT NULL,
	`auth_key` text NOT NULL,
	`content_encoding` varchar(50) DEFAULT 'aes128gcm',
	`browser` varchar(100),
	`browser_version` varchar(100),
	`operating_system` varchar(100),
	`device_type` varchar(50),
	`device_name` varchar(255),
	`language` varchar(50),
	`timezone` varchar(100),
	`is_pwa` boolean DEFAULT false,
	`is_active` boolean DEFAULT true,
	`permission_status` varchar(50) DEFAULT 'granted',
	`last_success_at` datetime,
	`last_failure_at` datetime,
	`failure_count` int DEFAULT 0,
	`expires_at` datetime,
	`revoked_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `recent_weddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(150) NOT NULL,
	`title` varchar(255) NOT NULL,
	`couple` varchar(255) NOT NULL,
	`date` varchar(50) NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(2) NOT NULL,
	`venue` varchar(255),
	`photographer_id` int,
	`photographer_name` varchar(255),
	`photographer_slug` varchar(150),
	`cover_image` text NOT NULL,
	`gallery` json DEFAULT ('[]'),
	`story` text,
	`style` varchar(100),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `recent_weddings_id` PRIMARY KEY(`id`),
	CONSTRAINT `recent_weddings_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int NOT NULL,
	`user_uid` varchar(255),
	`couple_name` varchar(255) NOT NULL,
	`date` varchar(50) NOT NULL,
	`wedding_location` varchar(255),
	`rating` int NOT NULL,
	`comment` text NOT NULL,
	`photos` json DEFAULT ('[]'),
	`photographer_reply` text,
	`verified_booking` boolean DEFAULT true,
	`status` varchar(20) DEFAULT 'approved',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);

CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `settings_setting_key_unique` UNIQUE(`setting_key`)
);

CREATE TABLE `smtp_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`is_enabled` boolean DEFAULT false,
	`host` varchar(255),
	`port` int DEFAULT 587,
	`secure_mode` varchar(50) DEFAULT 'STARTTLS',
	`username_encrypted` text,
	`password_encrypted` text,
	`from_name` varchar(255) DEFAULT 'Guia Fotógrafo Casamento',
	`from_email` varchar(255),
	`reply_to_email` varchar(255),
	`connection_timeout_ms` int DEFAULT 10000,
	`send_timeout_ms` int DEFAULT 15000,
	`rate_limit_per_minute` int DEFAULT 60,
	`rate_limit_per_hour` int DEFAULT 1000,
	`last_test_at` datetime,
	`last_test_status` varchar(50),
	`last_test_message` text,
	`created_by_admin_id` int,
	`updated_by_admin_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smtp_settings_id` PRIMARY KEY(`id`)
);

CREATE TABLE `states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`uf` varchar(2) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`ibge_code` varchar(20),
	`region` varchar(50) DEFAULT 'Sudeste',
	`image` text,
	`introductory_text` text,
	`seo_title` varchar(255),
	`seo_description` text,
	`show_in_navigation` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`status` varchar(20) DEFAULT 'active',
	`photographers_count` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `states_id` PRIMARY KEY(`id`),
	CONSTRAINT `states_uf_unique` UNIQUE(`uf`),
	CONSTRAINT `states_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `subscription_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscription_id` int,
	`photographer_id` int NOT NULL,
	`previous_plan_id` int,
	`new_plan_id` int,
	`previous_status` varchar(30),
	`new_status` varchar(30),
	`previous_billing_cycle` varchar(20),
	`new_billing_cycle` varchar(20),
	`event_type` varchar(50) NOT NULL,
	`performed_by_type` varchar(30) DEFAULT 'SYSTEM',
	`performed_user_id` int,
	`reason` text,
	`details_json` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_history_id` PRIMARY KEY(`id`)
);

CREATE TABLE `subscription_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscription_id` int,
	`photographer_id` int NOT NULL,
	`plan_id` int,
	`billing_cycle` varchar(20),
	`provider` varchar(30) DEFAULT 'SIMULATION',
	`external_payment_id` varchar(255),
	`simulation_event_id` varchar(255),
	`payment_reference` varchar(255),
	`amount` decimal(10,2) DEFAULT '0.00',
	`refund_amount` decimal(10,2) DEFAULT '0.00',
	`is_partial_refund` boolean DEFAULT false,
	`is_chargeback` boolean DEFAULT false,
	`currency` varchar(10) DEFAULT 'BRL',
	`status` varchar(30) DEFAULT 'PENDING',
	`payment_method` varchar(50) DEFAULT 'SIMULATION',
	`installments` int DEFAULT 1,
	`paid_at` datetime,
	`failed_at` datetime,
	`refunded_at` datetime,
	`cancelled_at` datetime,
	`failure_reason` text,
	`metadata_json` json,
	`created_by_admin_id` int,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_payments_id` PRIMARY KEY(`id`)
);

CREATE TABLE `subscription_plan_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_id` int,
	`feature_key` varchar(100) NOT NULL,
	`feature_name` varchar(255),
	`feature_type` varchar(50) DEFAULT 'boolean',
	`boolean_value` boolean DEFAULT false,
	`numeric_value` int,
	`text_value` text,
	`is_unlimited` boolean DEFAULT false,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_plan_features_id` PRIMARY KEY(`id`)
);

CREATE TABLE `subscription_plan_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plan_id` int,
	`title` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(100),
	`is_included` boolean DEFAULT true,
	`is_featured` boolean DEFAULT false,
	`limit_value` varchar(100),
	`is_unlimited` boolean DEFAULT false,
	`display_text` varchar(255),
	`sort_order` int DEFAULT 0,
	`status` varchar(20) DEFAULT 'active',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `subscription_plan_items_id` PRIMARY KEY(`id`)
);

CREATE TABLE `subscription_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`internal_name` varchar(100),
	`slug` varchar(100) NOT NULL,
	`internal_code` varchar(100),
	`plan_type` varchar(20) DEFAULT 'PREMIUM',
	`is_default_free_plan` boolean DEFAULT false,
	`short_description` text,
	`description` text,
	`currency` varchar(10) DEFAULT 'BRL',
	`is_free` boolean DEFAULT false,
	`monthly_price` decimal(10,2) DEFAULT '0.00',
	`annual_price` decimal(10,2) DEFAULT '0.00',
	`promotional_monthly_price` decimal(10,2),
	`promotional_annual_price` decimal(10,2),
	`annual_monthly_equivalent` decimal(10,2),
	`annual_savings_amount` decimal(10,2),
	`annual_discount_percentage` decimal(5,2),
	`setup_fee` decimal(10,2) DEFAULT '0.00',
	`trial_enabled` boolean DEFAULT false,
	`trial_days` int DEFAULT 0,
	`promotion_start_at` datetime,
	`promotion_end_at` datetime,
	`main_color` varchar(50) DEFAULT '#C88E9B',
	`text_color` varchar(50) DEFAULT '#5A4035',
	`button_color` varchar(50) DEFAULT '#C88E9B',
	`icon` varchar(100) DEFAULT 'Sparkles',
	`badge_text` varchar(100),
	`button_text` varchar(100) DEFAULT 'Assinar Agora',
	`button_url` text,
	`button_target` varchar(20) DEFAULT '_self',
	`text_above_price` text,
	`text_below_price` text,
	`is_recommended` boolean DEFAULT false,
	`is_premium` boolean DEFAULT false,
	`is_featured` boolean DEFAULT false,
	`show_on_home` boolean DEFAULT true,
	`show_on_pricing_page` boolean DEFAULT true,
	`show_on_registration` boolean DEFAULT true,
	`show_on_professional_dashboard` boolean DEFAULT true,
	`allow_monthly_billing` boolean DEFAULT true,
	`allow_annual_billing` boolean DEFAULT true,
	`allow_cancel` boolean DEFAULT true,
	`allow_upgrade` boolean DEFAULT true,
	`allow_downgrade` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`status` varchar(20) DEFAULT 'active',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `subscription_plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscription_plans_slug_unique` UNIQUE(`slug`)
);

CREATE TABLE `subscription_provider_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`subscription_id` int NOT NULL,
	`photographer_id` int NOT NULL,
	`provider` varchar(50) NOT NULL DEFAULT 'MERCADO_PAGO',
	`environment` varchar(20) NOT NULL DEFAULT 'TEST',
	`external_customer_id` varchar(255),
	`external_subscription_id` varchar(255),
	`external_plan_id` varchar(255),
	`external_reference` varchar(255),
	`external_status` varchar(100),
	`checkout_url` text,
	`init_point` text,
	`sandbox_init_point` text,
	`last_synchronized_at` datetime,
	`last_event_at` datetime,
	`metadata_json` json,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscription_provider_links_id` PRIMARY KEY(`id`)
);

CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`photographer_id` int,
	`plan_id` int,
	`status` varchar(20) DEFAULT 'active',
	`start_date` datetime DEFAULT CURRENT_TIMESTAMP,
	`next_billing_date` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`achievement_id` int NOT NULL,
	`unlocked_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_uid` varchar(255) NOT NULL,
	`task` varchar(255) NOT NULL,
	`timeframe` varchar(100),
	`completed` boolean DEFAULT false,
	`category` varchar(100),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_checklists_id` PRIMARY KEY(`id`)
);

CREATE TABLE `user_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`user_type` varchar(50) NOT NULL DEFAULT 'PHOTOGRAPHER',
	`event_type` varchar(100),
	`category` varchar(50) DEFAULT 'SYSTEM',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`image_url` text,
	`action_url` text,
	`resource_type` varchar(100),
	`resource_id` int,
	`priority` varchar(20) DEFAULT 'NORMAL',
	`is_read` boolean DEFAULT false,
	`read_at` datetime,
	`is_archived` boolean DEFAULT false,
	`archived_at` datetime,
	`metadata_json` json,
	`expires_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_notifications_id` PRIMARY KEY(`id`)
);

CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uid` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50),
	`password_hash` varchar(255),
	`role` varchar(50) NOT NULL DEFAULT 'BRIDE',
	`avatar` text,
	`cpf_cnpj` varchar(50),
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`last_login_at` datetime,
	`terms_accepted_at` datetime,
	`privacy_consent_at` datetime,
	`marketing_consent_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_uid_unique` UNIQUE(`uid`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);

CREATE TABLE `wedding_budget_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`budget_id` int NOT NULL,
	`category_name` varchar(100) NOT NULL,
	`percentage` decimal(5,2) NOT NULL,
	`planned_amount` decimal(12,2) DEFAULT '0.00',
	`actual_amount` decimal(12,2) DEFAULT '0.00',
	`sort_order` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_budget_categories_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_budget` decimal(12,2) DEFAULT '80000.00',
	`currency` varchar(10) DEFAULT 'BRL',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_budgets_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`event_type` varchar(100),
	`location` varchar(255),
	`start_at` varchar(100),
	`end_at` varchar(100),
	`all_day` boolean DEFAULT false,
	`reminder_enabled` boolean DEFAULT true,
	`reminder_minutes` int DEFAULT 60,
	`status` varchar(50) DEFAULT 'scheduled',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `wedding_events_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`supplier_name` varchar(255) NOT NULL,
	`category` varchar(100),
	`description` text,
	`contracted_amount` decimal(12,2) DEFAULT '0.00',
	`paid_amount` decimal(12,2) DEFAULT '0.00',
	`remaining_amount` decimal(12,2) DEFAULT '0.00',
	`due_date` varchar(50),
	`payment_status` varchar(50) DEFAULT 'Pendente',
	`payment_method` varchar(50),
	`notes` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `wedding_expenses_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_gifts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`estimated_value` decimal(12,2) DEFAULT '0.00',
	`product_url` text,
	`image` text,
	`is_purchased` boolean DEFAULT false,
	`purchased_by` varchar(255),
	`message` text,
	`purchased_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `wedding_gifts_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_guests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`email` varchar(255),
	`family_group` varchar(100),
	`companions` int DEFAULT 0,
	`table_name` varchar(100),
	`sector` varchar(100),
	`invitation_status` varchar(50) DEFAULT 'Pendente',
	`confirmation_status` varchar(50) DEFAULT 'pending',
	`dietary_restrictions` text,
	`notes` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `wedding_guests_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_rsvps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wedding_website_id` int NOT NULL,
	`guest_name` varchar(255) NOT NULL,
	`phone` varchar(50),
	`email` varchar(255),
	`companions` int DEFAULT 0,
	`confirmation_status` varchar(50) DEFAULT 'confirmed',
	`message` text,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_rsvps_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_style_quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`answers_json` json DEFAULT ('{}'),
	`result_style` varchar(100),
	`score_json` json DEFAULT ('{}'),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_style_quiz_results_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100),
	`recommended_month` varchar(100),
	`due_date` varchar(50),
	`priority` varchar(20) DEFAULT 'medium',
	`is_completed` boolean DEFAULT false,
	`completed_at` datetime,
	`sort_order` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `wedding_tasks_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_timeline_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timeline_id` int NOT NULL,
	`time` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`responsible` varchar(255),
	`location` varchar(255),
	`sort_order` int DEFAULT 0,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_timeline_items_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_timelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) DEFAULT 'Cronograma do Dia do Casamento',
	`wedding_date` varchar(50),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_timelines_id` PRIMARY KEY(`id`)
);

CREATE TABLE `wedding_websites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`slug` varchar(150) NOT NULL,
	`couple_names` varchar(255) NOT NULL,
	`headline` text,
	`story` text,
	`wedding_date` varchar(50),
	`ceremony_location` text,
	`reception_location` text,
	`cover_image` text,
	`theme` varchar(50) DEFAULT 'Romantic Rose',
	`primary_color` varchar(50) DEFAULT '#C88E9B',
	`is_published` boolean DEFAULT true,
	`rsvp_enabled` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wedding_websites_id` PRIMARY KEY(`id`),
	CONSTRAINT `wedding_websites_slug_unique` UNIQUE(`slug`)
);

ALTER TABLE `cities` ADD CONSTRAINT `cities_state_id_states_id_fk` FOREIGN KEY (`state_id`) REFERENCES `states`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `click_logs` ADD CONSTRAINT `click_logs_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `couple_profiles` ADD CONSTRAINT `couple_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `inspiration_favorites` ADD CONSTRAINT `inspiration_favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `installment_simulations` ADD CONSTRAINT `installment_simulations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `leads` ADD CONSTRAINT `leads_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photo_location_favorites` ADD CONSTRAINT `photo_location_favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_categories` ADD CONSTRAINT `photographer_categories_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_categories` ADD CONSTRAINT `photographer_categories_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_favorites` ADD CONSTRAINT `photographer_favorites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_favorites` ADD CONSTRAINT `photographer_favorites_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_media` ADD CONSTRAINT `photographer_media_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_packages` ADD CONSTRAINT `photographer_packages_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_plan_periods` ADD CONSTRAINT `photographer_plan_periods_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_subscriptions` ADD CONSTRAINT `photographer_subscriptions_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photographer_subscriptions` ADD CONSTRAINT `photographer_subscriptions_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `photographers` ADD CONSTRAINT `photographers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `photography_quote_requests` ADD CONSTRAINT `photography_quote_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photography_quote_requests` ADD CONSTRAINT `photography_quote_requests_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `photography_quote_simulations` ADD CONSTRAINT `photography_quote_simulations_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `recent_weddings` ADD CONSTRAINT `recent_weddings_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscription_history` ADD CONSTRAINT `subscription_history_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_subscription_id_photographer_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `photographer_subscriptions`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscription_payments` ADD CONSTRAINT `subscription_payments_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `subscription_plan_features` ADD CONSTRAINT `subscription_plan_features_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscription_plan_items` ADD CONSTRAINT `subscription_plan_items_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscription_provider_links` ADD CONSTRAINT `subscription_provider_links_subscription_id_photographer_subscriptions_id_fk` FOREIGN KEY (`subscription_id`) REFERENCES `photographer_subscriptions`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscription_provider_links` ADD CONSTRAINT `subscription_provider_links_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_photographer_id_photographers_id_fk` FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_subscription_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE set null ON UPDATE no action;
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_achievement_id_achievements_id_fk` FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_budget_categories` ADD CONSTRAINT `wedding_budget_categories_budget_id_wedding_budgets_id_fk` FOREIGN KEY (`budget_id`) REFERENCES `wedding_budgets`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_budgets` ADD CONSTRAINT `wedding_budgets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_events` ADD CONSTRAINT `wedding_events_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_expenses` ADD CONSTRAINT `wedding_expenses_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_gifts` ADD CONSTRAINT `wedding_gifts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_guests` ADD CONSTRAINT `wedding_guests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_rsvps` ADD CONSTRAINT `wedding_rsvps_wedding_website_id_wedding_websites_id_fk` FOREIGN KEY (`wedding_website_id`) REFERENCES `wedding_websites`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_style_quiz_results` ADD CONSTRAINT `wedding_style_quiz_results_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_tasks` ADD CONSTRAINT `wedding_tasks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_timeline_items` ADD CONSTRAINT `wedding_timeline_items_timeline_id_wedding_timelines_id_fk` FOREIGN KEY (`timeline_id`) REFERENCES `wedding_timelines`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_timelines` ADD CONSTRAINT `wedding_timelines_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `wedding_websites` ADD CONSTRAINT `wedding_websites_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;

-- 0001_mysql-content-catalogs-and-indexes.sql
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

ALTER TABLE `event_reminders` ADD CONSTRAINT `uq_event_reminder` UNIQUE(`event_id`,`reminder_type`,`remind_at`);
ALTER TABLE `inspiration_favorites` ADD CONSTRAINT `uq_inspiration_favorite` UNIQUE(`user_id`,`inspiration_id`);
ALTER TABLE `notification_automation_rules` ADD CONSTRAINT `uq_automation_rule` UNIQUE(`event_type`,`user_type`);
ALTER TABLE `notification_preferences` ADD CONSTRAINT `uq_notification_preference` UNIQUE(`user_id`,`event_type`);
ALTER TABLE `photo_location_favorites` ADD CONSTRAINT `uq_photo_location_favorite` UNIQUE(`user_id`,`location_id`);
ALTER TABLE `photographer_favorites` ADD CONSTRAINT `uq_photographer_favorite` UNIQUE(`user_id`,`photographer_id`);
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `uq_push_user_endpoint` UNIQUE(`user_id`,`endpoint_hash`);
CREATE INDEX `idx_inspirations_status_order` ON `inspirations` (`status`,`sort_order`);
CREATE INDEX `idx_photo_locations_status_order` ON `photo_locations` (`status`,`sort_order`);
CREATE INDEX `idx_reminder_worker` ON `event_reminders` (`status`,`remind_at`);
CREATE INDEX `idx_delivery_worker` ON `notification_delivery_queue` (`status`,`scheduled_at`);
CREATE INDEX `idx_push_active_user` ON `push_subscriptions` (`is_active`,`user_id`);
