import { getMysqlPool } from './index.ts';

export async function ensureTablesExist() {
  const pool = getMysqlPool();
  try {
    const conn = await pool.getConnection();

    try {
      // 1. Users
      await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          uid VARCHAR(255) NOT NULL UNIQUE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          phone VARCHAR(50),
          password_hash VARCHAR(255),
          role VARCHAR(50) NOT NULL DEFAULT 'BRIDE',
          avatar TEXT,
          cpf_cnpj VARCHAR(50),
          status VARCHAR(20) NOT NULL DEFAULT 'active',
          last_login_at DATETIME,
          terms_accepted_at DATETIME,
          privacy_consent_at DATETIME,
          marketing_consent_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Add missing columns if users table existed previously
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN terms_accepted_at DATETIME;`);
      } catch (e) {}
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN privacy_consent_at DATETIME;`);
      } catch (e) {}
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN marketing_consent_at DATETIME;`);
      } catch (e) {}
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN last_login_at DATETIME;`);
      } catch (e) {}
      try {
        await conn.query(`ALTER TABLE users ADD COLUMN deleted_at DATETIME;`);
      } catch (e) {}

      // 2. Couple Profiles
      await conn.query(`
        CREATE TABLE IF NOT EXISTS couple_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          partner_name VARCHAR(255),
          wedding_date VARCHAR(50),
          wedding_type VARCHAR(100),
          estimated_guests INT DEFAULT 100,
          estimated_budget DECIMAL(12,2) DEFAULT 80000.00,
          wedding_style VARCHAR(100),
          ceremony_location VARCHAR(255),
          reception_location VARCHAR(255),
          state_id INT,
          city_id INT,
          couple_photo TEXT,
          planning_progress INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 3. Wedding Tasks
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          category VARCHAR(100),
          recommended_month VARCHAR(100),
          due_date VARCHAR(50),
          priority VARCHAR(20) DEFAULT 'medium',
          is_completed TINYINT(1) DEFAULT 0,
          completed_at DATETIME,
          sort_order INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 4. Wedding Events
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          event_type VARCHAR(100),
          location VARCHAR(255),
          start_at VARCHAR(100),
          end_at VARCHAR(100),
          all_day TINYINT(1) DEFAULT 0,
          reminder_enabled TINYINT(1) DEFAULT 1,
          reminder_minutes INT DEFAULT 60,
          status VARCHAR(50) DEFAULT 'scheduled',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 5. Wedding Budgets
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_budgets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          total_budget DECIMAL(12,2) DEFAULT 80000.00,
          currency VARCHAR(10) DEFAULT 'BRL',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 6. Wedding Budget Categories
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_budget_categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          budget_id INT NOT NULL,
          category_name VARCHAR(100) NOT NULL,
          percentage DECIMAL(5,2) NOT NULL,
          planned_amount DECIMAL(12,2) DEFAULT 0.00,
          actual_amount DECIMAL(12,2) DEFAULT 0.00,
          sort_order INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (budget_id) REFERENCES wedding_budgets(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 7. Wedding Expenses
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_expenses (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          supplier_name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          description TEXT,
          contracted_amount DECIMAL(12,2) DEFAULT 0.00,
          paid_amount DECIMAL(12,2) DEFAULT 0.00,
          remaining_amount DECIMAL(12,2) DEFAULT 0.00,
          due_date VARCHAR(50),
          payment_status VARCHAR(50) DEFAULT 'Pendente',
          payment_method VARCHAR(50),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 8. Installment Simulations
      await conn.query(`
        CREATE TABLE IF NOT EXISTS installment_simulations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          description VARCHAR(255) NOT NULL,
          total_amount DECIMAL(12,2) NOT NULL,
          installments INT NOT NULL,
          installment_amount DECIMAL(12,2) NOT NULL,
          interest_rate DECIMAL(5,2) DEFAULT 0.00,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 9. Wedding Guests
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_guests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(255),
          family_group VARCHAR(100),
          companions INT DEFAULT 0,
          table_name VARCHAR(100),
          sector VARCHAR(100),
          invitation_status VARCHAR(50) DEFAULT 'Pendente',
          confirmation_status VARCHAR(50) DEFAULT 'pending',
          dietary_restrictions TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 10. Wedding Gifts
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_gifts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          estimated_value DECIMAL(12,2) DEFAULT 0.00,
          product_url TEXT,
          image TEXT,
          is_purchased TINYINT(1) DEFAULT 0,
          purchased_by VARCHAR(255),
          message TEXT,
          purchased_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 11. Inspiration Favorites
      await conn.query(`
        CREATE TABLE IF NOT EXISTS inspiration_favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          inspiration_id VARCHAR(100) NOT NULL,
          title VARCHAR(255),
          category VARCHAR(100),
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 12. Photographer Favorites
      await conn.query(`
        CREATE TABLE IF NOT EXISTS photographer_favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          photographer_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 13. Photo Location Favorites
      await conn.query(`
        CREATE TABLE IF NOT EXISTS photo_location_favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          location_id VARCHAR(100) NOT NULL,
          location_name VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 14. Photography Quote Simulations
      await conn.query(`
        CREATE TABLE IF NOT EXISTS photography_quote_simulations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          city_id INT,
          guest_count INT,
          wedding_type VARCHAR(100),
          coverage_hours INT,
          include_drone TINYINT(1) DEFAULT 0,
          include_album TINYINT(1) DEFAULT 0,
          include_second_photographer TINYINT(1) DEFAULT 0,
          estimated_min_price DECIMAL(12,2),
          estimated_max_price DECIMAL(12,2),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 15. Photography Quote Requests
      await conn.query(`
        CREATE TABLE IF NOT EXISTS photography_quote_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          simulation_id INT,
          photographer_id INT NOT NULL,
          message TEXT,
          status VARCHAR(50) DEFAULT 'Novo',
          sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          viewed_at DATETIME,
          responded_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 16. Wedding Timelines
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_timelines (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) DEFAULT 'Cronograma do Dia do Casamento',
          wedding_date VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 17. Wedding Timeline Items
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_timeline_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          timeline_id INT NOT NULL,
          time VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          responsible VARCHAR(255),
          location VARCHAR(255),
          sort_order INT DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (timeline_id) REFERENCES wedding_timelines(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 18. Wedding Websites
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_websites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          slug VARCHAR(150) NOT NULL UNIQUE,
          couple_names VARCHAR(255) NOT NULL,
          headline TEXT,
          story TEXT,
          wedding_date VARCHAR(50),
          ceremony_location TEXT,
          reception_location TEXT,
          cover_image TEXT,
          theme VARCHAR(50) DEFAULT 'Romantic Rose',
          primary_color VARCHAR(50) DEFAULT '#C88E9B',
          is_published TINYINT(1) DEFAULT 1,
          rsvp_enabled TINYINT(1) DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 19. Wedding RSVPs
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_rsvps (
          id INT AUTO_INCREMENT PRIMARY KEY,
          wedding_website_id INT NOT NULL,
          guest_name VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          email VARCHAR(255),
          companions INT DEFAULT 0,
          confirmation_status VARCHAR(50) DEFAULT 'confirmed',
          message TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (wedding_website_id) REFERENCES wedding_websites(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 20. Wedding Style Quiz Results
      await conn.query(`
        CREATE TABLE IF NOT EXISTS wedding_style_quiz_results (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          answers_json JSON,
          result_style VARCHAR(100),
          score_json JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 21. Achievements
      await conn.query(`
        CREATE TABLE IF NOT EXISTS achievements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          icon VARCHAR(100),
          category VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 22. User Achievements
      await conn.query(`
        CREATE TABLE IF NOT EXISTS user_achievements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          achievement_id INT NOT NULL,
          unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 23. Password Resets
      await conn.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires_at DATETIME NOT NULL,
          used_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 24. Subscription Plans Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS subscription_plans (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          internal_name VARCHAR(100),
          slug VARCHAR(100) NOT NULL UNIQUE,
          internal_code VARCHAR(100),
          plan_type VARCHAR(20) DEFAULT 'PREMIUM',
          is_default_free_plan TINYINT(1) DEFAULT 0,
          short_description TEXT,
          description TEXT,
          currency VARCHAR(10) DEFAULT 'BRL',
          is_free TINYINT(1) DEFAULT 0,
          monthly_price DECIMAL(10,2) DEFAULT 0.00,
          annual_price DECIMAL(10,2) DEFAULT 0.00,
          promotional_monthly_price DECIMAL(10,2),
          promotional_annual_price DECIMAL(10,2),
          annual_monthly_equivalent DECIMAL(10,2),
          annual_savings_amount DECIMAL(10,2),
          annual_discount_percentage DECIMAL(5,2),
          setup_fee DECIMAL(10,2) DEFAULT 0.00,
          trial_enabled TINYINT(1) DEFAULT 0,
          trial_days INT DEFAULT 0,
          promotion_start_at DATETIME,
          promotion_end_at DATETIME,
          main_color VARCHAR(50) DEFAULT '#C88E9B',
          text_color VARCHAR(50) DEFAULT '#5A4035',
          button_color VARCHAR(50) DEFAULT '#C88E9B',
          icon VARCHAR(100) DEFAULT 'Sparkles',
          badge_text VARCHAR(100),
          button_text VARCHAR(100) DEFAULT 'Assinar Agora',
          button_url TEXT,
          button_target VARCHAR(20) DEFAULT '_self',
          text_above_price TEXT,
          text_below_price TEXT,
          is_recommended TINYINT(1) DEFAULT 0,
          is_premium TINYINT(1) DEFAULT 0,
          is_featured TINYINT(1) DEFAULT 0,
          show_on_home TINYINT(1) DEFAULT 1,
          show_on_pricing_page TINYINT(1) DEFAULT 1,
          show_on_registration TINYINT(1) DEFAULT 1,
          show_on_professional_dashboard TINYINT(1) DEFAULT 1,
          allow_monthly_billing TINYINT(1) DEFAULT 1,
          allow_annual_billing TINYINT(1) DEFAULT 1,
          allow_cancel TINYINT(1) DEFAULT 1,
          allow_upgrade TINYINT(1) DEFAULT 1,
          allow_downgrade TINYINT(1) DEFAULT 1,
          sort_order INT DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at DATETIME
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      try {
        await conn.query(`ALTER TABLE subscription_plans ADD COLUMN plan_type VARCHAR(20) DEFAULT 'PREMIUM';`);
      } catch (e) {}
      try {
        await conn.query(`ALTER TABLE subscription_plans ADD COLUMN is_default_free_plan TINYINT(1) DEFAULT 0;`);
      } catch (e) {}

      // 25. Photographer Subscriptions Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS photographer_subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          photographer_id INT NOT NULL,
          plan_id INT,
          billing_cycle VARCHAR(20) DEFAULT 'MONTHLY',
          status VARCHAR(30) DEFAULT 'ACTIVE',
          source VARCHAR(30) DEFAULT 'SIMULATION',
          starts_at DATETIME,
          current_period_start DATETIME,
          current_period_end DATETIME,
          next_billing_at DATETIME,
          cancel_at_period_end TINYINT(1) DEFAULT 0,
          cancel_requested_at DATETIME,
          cancelled_at DATETIME,
          expired_at DATETIME,
          suspended_at DATETIME,
          reactivated_at DATETIME,
          grace_period_ends_at DATETIME,
          created_by_admin_id INT,
          admin_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE,
          FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 26. Subscription Payments Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS subscription_payments (
          id INT AUTO_INCREMENT PRIMARY KEY,
          subscription_id INT,
          photographer_id INT NOT NULL,
          plan_id INT,
          billing_cycle VARCHAR(20),
          provider VARCHAR(30) DEFAULT 'SIMULATION',
          external_payment_id VARCHAR(255),
          payment_reference VARCHAR(255),
          amount DECIMAL(10,2) DEFAULT 0.00,
          currency VARCHAR(10) DEFAULT 'BRL',
          status VARCHAR(30) DEFAULT 'PENDING',
          payment_method VARCHAR(50) DEFAULT 'SIMULATION',
          installments INT DEFAULT 1,
          paid_at DATETIME,
          failed_at DATETIME,
          refunded_at DATETIME,
          cancelled_at DATETIME,
          failure_reason TEXT,
          metadata_json JSON,
          created_by_admin_id INT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE,
          FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL,
          FOREIGN KEY (subscription_id) REFERENCES photographer_subscriptions(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 27. Subscription History Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS subscription_history (
          id INT AUTO_INCREMENT PRIMARY KEY,
          subscription_id INT,
          photographer_id INT NOT NULL,
          previous_plan_id INT,
          new_plan_id INT,
          previous_status VARCHAR(30),
          new_status VARCHAR(30),
          previous_billing_cycle VARCHAR(20),
          new_billing_cycle VARCHAR(20),
          event_type VARCHAR(50) NOT NULL,
          performed_by_type VARCHAR(30) DEFAULT 'SYSTEM',
          performed_user_id INT,
          reason TEXT,
          details_json JSON,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // 28. Photographer Plan Periods Table
      await conn.query(`
        CREATE TABLE IF NOT EXISTS photographer_plan_periods (
          id INT AUTO_INCREMENT PRIMARY KEY,
          photographer_id INT NOT NULL,
          subscription_id INT,
          plan_id INT NOT NULL,
          started_at DATETIME NOT NULL,
          ended_at DATETIME,
          end_reason VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log('✅ Tabela(s) de Assinaturas e Portal Noivas verificadas / criadas no MySQL com sucesso!');
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.warn('Notice: MySQL tables auto-creation check skipped or encountered warning:', err?.message || err);
  }
}
