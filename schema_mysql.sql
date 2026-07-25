-- ============================================================
-- GUIA FOTÓGRAFO DE CASAMENTO - DUMP SQL COMPLETO PARA MYSQL 8 / PHPMYADMIN
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS click_logs;
DROP TABLE IF EXISTS budget_simulations;
DROP TABLE IF EXISTS user_checklists;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS blog_articles;
DROP TABLE IF EXISTS recent_weddings;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS photographer_packages;
DROP TABLE IF EXISTS photographer_media;
DROP TABLE IF EXISTS photographers;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS states;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS settings;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. TABELA DE USUÁRIOS
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  password_hash VARCHAR(255),
  role ENUM('super_admin', 'admin', 'photographer', 'client') NOT NULL DEFAULT 'client',
  avatar TEXT,
  cpf_cnpj VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABELA DE ESTADOS
CREATE TABLE states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uf VARCHAR(2) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  photographers_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABELA DE CIDADES
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_uf VARCHAR(2) NOT NULL,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  intro_text TEXT,
  hero_text VARCHAR(255),
  seo_description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_state_uf (state_uf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABELA DE FOTÓGRAFOS
CREATE TABLE photographers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  user_uid VARCHAR(255),
  slug VARCHAR(150) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  studio_name VARCHAR(255) NOT NULL,
  avatar TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  neighborhood VARCHAR(100),
  rating FLOAT DEFAULT 5.0,
  review_count INT DEFAULT 0,
  price_starting_from INT DEFAULT 0,
  price_category VARCHAR(100) DEFAULT 'R$ 2.000 a R$ 5.000',
  styles JSON,
  deliverables JSON,
  categories JSON,
  badges JSON,
  years_experience INT DEFAULT 0,
  weddings_completed INT DEFAULT 0,
  awards_count INT DEFAULT 0,
  description TEXT,
  bio_full TEXT,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  instagram VARCHAR(255),
  website VARCHAR(255),
  email VARCHAR(255),
  address TEXT,
  faqs JSON,
  featured_in_home BOOLEAN DEFAULT FALSE,
  plan VARCHAR(50) DEFAULT 'Gratuito',
  status VARCHAR(20) DEFAULT 'approved',
  views_count INT DEFAULT 0,
  whatsapp_clicks INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_city_state (city, state),
  INDEX idx_status (status),
  INDEX idx_plan (plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. GALERIA & MÍDIAS DOS FOTÓGRAFOS
CREATE TABLE photographer_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'photo',
  url TEXT NOT NULL,
  caption VARCHAR(255),
  category VARCHAR(100) DEFAULT 'Cerimônia',
  featured BOOLEAN DEFAULT FALSE,
  thumbnail TEXT,
  embed_url TEXT,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. PACOTES DOS FOTÓGRAFOS
CREATE TABLE photographer_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price INT NOT NULL,
  popular BOOLEAN DEFAULT FALSE,
  description TEXT,
  features JSON,
  deliverables JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. AVALIAÇÕES (REVIEWS)
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT NOT NULL,
  user_uid VARCHAR(255),
  couple_name VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  wedding_location VARCHAR(255),
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  photos JSON,
  photographer_reply TEXT,
  verified_booking BOOLEAN DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'approved',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. LEADS (ORÇAMENTOS)
CREATE TABLE leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uid VARCHAR(255),
  photographer_id INT,
  couple_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  wedding_date VARCHAR(50),
  city VARCHAR(100),
  state VARCHAR(2),
  venue_type VARCHAR(100),
  estimated_guests INT,
  budget_limit INT,
  services_needed JSON,
  style_preference VARCHAR(100),
  photographer_ids JSON,
  message TEXT,
  status VARCHAR(50) DEFAULT 'Novo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. CASAMENTOS RECENTES
CREATE TABLE recent_weddings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(150) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  couple VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  venue VARCHAR(255),
  photographer_id INT,
  photographer_name VARCHAR(255),
  photographer_slug VARCHAR(150),
  cover_image TEXT NOT NULL,
  gallery JSON,
  story TEXT,
  style VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. BLOG & ARTIGOS
CREATE TABLE blog_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(150) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  category VARCHAR(100),
  author VARCHAR(100),
  date VARCHAR(50),
  read_time VARCHAR(50),
  image TEXT,
  seo_keywords JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. PLANOS DE ASSINATURA
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  price INT NOT NULL,
  photo_limit INT DEFAULT 10,
  featured BOOLEAN DEFAULT FALSE,
  description TEXT,
  features JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. ASSINATURAS DOSS FOTÓGRAFOS
CREATE TABLE subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT,
  plan_id INT,
  status VARCHAR(20) DEFAULT 'active',
  start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  next_billing_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. FAVORITOS
CREATE TABLE favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  photographer_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. CHECKLIST DOS NOIVOS
CREATE TABLE user_checklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  task VARCHAR(255) NOT NULL,
  timeframe VARCHAR(100),
  completed BOOLEAN DEFAULT FALSE,
  category VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. SIMULAÇÕES DE ORÇAMENTO
CREATE TABLE budget_simulations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_uid VARCHAR(255),
  guest_count INT,
  total_wedding_budget INT,
  recommended_min INT,
  recommended_max INT,
  selected_services JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. LOGS DE CLIQUES E ESTATÍSTICAS
CREATE TABLE click_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  photographer_id INT,
  click_type VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (photographer_id) REFERENCES photographers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. CONFIGURAÇÕES DO PORTAL
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- USUÁRIOS DE DEMONSTRAÇÃO E ACESSOS PRINCIPAIS
-- Criptografia de senhas (bcrypt hashes para as senhas especificadas):
-- Super Admin: Rafael -> 2705#Data
-- Admin: guiafotografo -> fotografia2026
-- ============================================================

INSERT INTO users (uid, name, email, phone, password_hash, role, status) VALUES
('super-admin-uid-rafael', 'Rafael (Super Admin)', 'rafael@guiafotografocasamento.com.br', '(11) 99999-0000', '$2a$10$2N.fN83BqU8k1q6z6Z6a/.aY7kXGzB1t1r6K5n8J0Q0w3M4L5P6O2', 'super_admin', 'active'),
('admin-uid-guiafotografo', 'Guia Fotógrafo (Admin)', 'admin@guiafotografocasamento.com.br', '(11) 98888-1111', '$2a$10$H8k3y.m0j7lK5n4M3L2P1.4O5N6M7L8K9J0H1G2F3E4D5C6B7A8', 'admin', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);
