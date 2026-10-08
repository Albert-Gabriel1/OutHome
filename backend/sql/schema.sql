CREATE DATABASE IF NOT EXISTS site_viagens
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE site_viagens;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS destinos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(150) NOT NULL,
  cidade VARCHAR(120) NULL,
  pais VARCHAR(120) NOT NULL,
  descricao TEXT NULL,
  imagem_url VARCHAR(500) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS roteiros (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  usuario_id INT UNSIGNED NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  descricao TEXT NULL,
  publico BOOLEAN NOT NULL DEFAULT FALSE,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_roteiros_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dias_roteiro (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  roteiro_id INT UNSIGNED NOT NULL,
  data DATE NOT NULL,
  ordem INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_dias_roteiro
    FOREIGN KEY (roteiro_id) REFERENCES roteiros(id)
    ON DELETE CASCADE,
  INDEX idx_dias_roteiro_roteiro (roteiro_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS atividades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  dia_id INT UNSIGNED NOT NULL,
  destino_id INT UNSIGNED NULL,
  titulo VARCHAR(180) NOT NULL,
  horario TIME NULL,
  custo_estimado DECIMAL(10,2) NOT NULL DEFAULT 0,
  categoria VARCHAR(80) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_atividades_dia
    FOREIGN KEY (dia_id) REFERENCES dias_roteiro(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_atividades_destino
    FOREIGN KEY (destino_id) REFERENCES destinos(id)
    ON DELETE SET NULL,
  INDEX idx_atividades_dia (dia_id)
) ENGINE=InnoDB;

INSERT INTO destinos (nome, cidade, pais, descricao, imagem_url)
SELECT "Coliseu", "Roma", "Itália", "Anfiteatro histórico de Roma.", NULL
WHERE NOT EXISTS (
  SELECT 1 FROM destinos WHERE nome = "Coliseu" AND cidade = "Roma"
);

INSERT INTO destinos (nome, cidade, pais, descricao, imagem_url)
SELECT "Torre de Belém", "Lisboa", "Portugal", "Monumento histórico às margens do Tejo.", NULL
WHERE NOT EXISTS (
  SELECT 1 FROM destinos WHERE nome = "Torre de Belém" AND cidade = "Lisboa"
);

INSERT INTO destinos (nome, cidade, pais, descricao, imagem_url)
SELECT "Fushimi Inari", "Kyoto", "Japão", "Santuário conhecido pelos milhares de torii.", NULL
WHERE NOT EXISTS (
  SELECT 1 FROM destinos WHERE nome = "Fushimi Inari" AND cidade = "Kyoto"
);
