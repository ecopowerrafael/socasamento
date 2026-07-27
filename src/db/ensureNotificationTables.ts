import { getMysqlPool } from './index.ts';

const statements = [
  `CREATE TABLE IF NOT EXISTS push_notification_settings (
    id INT AUTO_INCREMENT PRIMARY KEY, is_enabled BOOLEAN DEFAULT TRUE,
    vapid_public_key TEXT, vapid_private_key_encrypted TEXT, vapid_subject TEXT,
    default_icon_url TEXT, default_badge_url TEXT, default_click_url TEXT,
    max_daily_manual_sends INT DEFAULT 10, quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start VARCHAR(10) DEFAULT '22:00', quiet_hours_end VARCHAR(10) DEFAULT '08:00',
    timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo', last_test_at DATETIME NULL,
    last_test_status VARCHAR(50), last_test_message TEXT, created_by_admin_id INT,
    updated_by_admin_id INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, user_type VARCHAR(50) NOT NULL,
    endpoint TEXT NOT NULL, endpoint_hash VARCHAR(255) NOT NULL, p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL, content_encoding VARCHAR(50) DEFAULT 'aes128gcm',
    browser VARCHAR(100), browser_version VARCHAR(100), operating_system VARCHAR(100),
    device_type VARCHAR(50), device_name VARCHAR(255), language VARCHAR(50), timezone VARCHAR(100),
    is_pwa BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE,
    permission_status VARCHAR(50) DEFAULT 'granted', last_success_at DATETIME NULL,
    last_failure_at DATETIME NULL, failure_count INT DEFAULT 0, expires_at DATETIME NULL,
    revoked_at DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_push_user_endpoint (user_id, endpoint_hash), INDEX idx_push_active (is_active, user_id)
  )`,
  `CREATE TABLE IF NOT EXISTS user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, user_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(100), category VARCHAR(50) DEFAULT 'SYSTEM', title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL, image_url TEXT, action_url TEXT, resource_type VARCHAR(100),
    resource_id INT, priority VARCHAR(20) DEFAULT 'NORMAL', is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME NULL, is_archived BOOLEAN DEFAULT FALSE, archived_at DATETIME NULL,
    metadata_json JSON, expires_at DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notifications_user (user_id, is_archived, created_at),
    INDEX idx_notifications_unread (user_id, is_read)
  )`,
  `CREATE TABLE IF NOT EXISTS notification_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL, user_type VARCHAR(50),
    event_type VARCHAR(100) NOT NULL, in_app_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE, email_enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_notification_preference (user_id, event_type)
  )`,
  `CREATE TABLE IF NOT EXISTS push_campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL, image_url TEXT, action_url TEXT, target_type VARCHAR(50) DEFAULT 'ALL',
    target_filters_json JSON, priority VARCHAR(20) DEFAULT 'NORMAL', status VARCHAR(50) DEFAULT 'DRAFT',
    scheduled_at DATETIME NULL, started_at DATETIME NULL, completed_at DATETIME NULL,
    cancelled_at DATETIME NULL, total_users INT DEFAULT 0, total_devices INT DEFAULT 0,
    total_sent INT DEFAULT 0, total_delivered INT DEFAULT 0, total_failed INT DEFAULT 0,
    total_clicked INT DEFAULT 0, created_by_admin_id INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS push_campaign_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY, campaign_id INT NOT NULL, user_id INT NOT NULL,
    push_subscription_id INT, status VARCHAR(50) DEFAULT 'PENDING', sent_at DATETIME NULL,
    delivered_at DATETIME NULL, clicked_at DATETIME NULL, failed_at DATETIME NULL,
    failure_code VARCHAR(100), failure_message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_campaign_recipient (campaign_id, status)
  )`,
  `CREATE TABLE IF NOT EXISTS notification_delivery_queue (
    id INT AUTO_INCREMENT PRIMARY KEY, notification_id INT, campaign_id INT, user_id INT,
    channel VARCHAR(20) NOT NULL, destination_reference TEXT, status VARCHAR(50) DEFAULT 'PENDING',
    attempts INT DEFAULT 0, max_attempts INT DEFAULT 5, scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processing_started_at DATETIME NULL, sent_at DATETIME NULL, failed_at DATETIME NULL,
    next_retry_at DATETIME NULL, error_code VARCHAR(100), error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_delivery_worker (status, scheduled_at)
  )`,
  `CREATE TABLE IF NOT EXISTS smtp_settings (
    id INT AUTO_INCREMENT PRIMARY KEY, is_enabled BOOLEAN DEFAULT FALSE, host VARCHAR(255),
    port INT DEFAULT 587, secure_mode VARCHAR(50) DEFAULT 'STARTTLS', username_encrypted TEXT,
    password_encrypted TEXT, from_name VARCHAR(255), from_email VARCHAR(255),
    reply_to_email VARCHAR(255), connection_timeout_ms INT DEFAULT 10000,
    send_timeout_ms INT DEFAULT 15000, rate_limit_per_minute INT DEFAULT 60,
    rate_limit_per_hour INT DEFAULT 1000, last_test_at DATETIME NULL,
    last_test_status VARCHAR(50), last_test_message TEXT, created_by_admin_id INT,
    updated_by_admin_id INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS email_messages (
    id INT AUTO_INCREMENT PRIMARY KEY, user_id INT, notification_id INT, template_id INT,
    recipient_email VARCHAR(255) NOT NULL, recipient_name VARCHAR(255), subject VARCHAR(255) NOT NULL,
    body_html TEXT, body_text TEXT, status VARCHAR(50) DEFAULT 'PENDING',
    priority VARCHAR(20) DEFAULT 'NORMAL', scheduled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processing_started_at DATETIME NULL, sent_at DATETIME NULL, failed_at DATETIME NULL,
    attempts INT DEFAULT 0, provider_message_id VARCHAR(255), error_code VARCHAR(100),
    error_message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email_worker (status, scheduled_at)
  )`,
  `CREATE TABLE IF NOT EXISTS notification_deliveries (
    id INT AUTO_INCREMENT PRIMARY KEY, notification_id INT, user_id INT, channel VARCHAR(20) NOT NULL,
    destination_id VARCHAR(255), status VARCHAR(50) NOT NULL, attempts INT DEFAULT 1,
    sent_at DATETIME NULL, delivered_at DATETIME NULL, opened_at DATETIME NULL,
    clicked_at DATETIME NULL, failed_at DATETIME NULL, error_code VARCHAR(100),
    error_message TEXT, metadata_json JSON, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notification_automation_rules (
    id INT AUTO_INCREMENT PRIMARY KEY, event_type VARCHAR(100) NOT NULL, user_type VARCHAR(50) DEFAULT 'ALL',
    is_active BOOLEAN DEFAULT TRUE, in_app_enabled BOOLEAN DEFAULT TRUE, push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE, email_delay_minutes INT DEFAULT 0, push_delay_minutes INT DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'NORMAL', template_in_app_id INT, template_push_id INT,
    template_email_id INT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_automation_rule (event_type, user_type)
  )`,
  `CREATE TABLE IF NOT EXISTS notification_templates (
    id INT AUTO_INCREMENT PRIMARY KEY, event_type VARCHAR(100) NOT NULL, channel VARCHAR(20) NOT NULL,
    user_type VARCHAR(50) DEFAULT 'ALL', name VARCHAR(255) NOT NULL, subject VARCHAR(255),
    title VARCHAR(255), body_html TEXT, body_text TEXT, action_label VARCHAR(100),
    action_url_template TEXT, is_active BOOLEAN DEFAULT TRUE, version INT DEFAULT 1,
    available_variables_json JSON, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS event_reminders (
    id INT AUTO_INCREMENT PRIMARY KEY, event_id INT NOT NULL, user_id INT NOT NULL,
    reminder_type VARCHAR(50) DEFAULT '1_DAY_BEFORE', remind_at DATETIME NOT NULL,
    channels_json JSON, status VARCHAR(50) DEFAULT 'SCHEDULED', sent_at DATETIME NULL,
    cancelled_at DATETIME NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_event_reminder (event_id, reminder_type, remind_at),
    INDEX idx_reminder_worker (status, remind_at)
  )`,
];

export async function ensureNotificationTables() {
  const pool = getMysqlPool();
  for (const statement of statements) await pool.query(statement);
}
