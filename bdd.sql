CREATE DATABASE IF NOT EXISTS pj_agenda;
USE pj_agenda;

CREATE TABLE IF NOT EXISTS users (
    id_user INT AUTO_INCREMENT PRIMARY KEY,
    nom_user VARCHAR(50) NOT NULL,
    prenom_user VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mdp_user VARCHAR(255) NOT NULL,
    date_changement_mdp_user TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status_user ENUM('active', 'inactive') DEFAULT 'active',
    user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
    id_class INT AUTO_INCREMENT PRIMARY KEY,
    nom_class VARCHAR(100) NOT NULL,
    class_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    class_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS niveaux (
    id_niveau INT AUTO_INCREMENT PRIMARY KEY,
    nom_niveau VARCHAR(100) NOT NULL,
    id_class INT,
    FOREIGN KEY (id_class) REFERENCES classes(id_class) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS droits (
    id_droit INT AUTO_INCREMENT PRIMARY KEY,
    lib_droit VARCHAR(100) NOT NULL,
    status_droit ENUM('active', 'inactive') DEFAULT 'active',
    droit_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    droit_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendriers (
    id_cal INT AUTO_INCREMENT PRIMARY KEY,
    nom_cal VARCHAR(100) NOT NULL,
    cal_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cal_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evenements (
    id_event INT AUTO_INCREMENT PRIMARY KEY,
    titre_event VARCHAR(200) NOT NULL,
    description_event TEXT,
    date_debut_event DATETIME NOT NULL,
    date_fin_event DATETIME NOT NULL,
    type_event VARCHAR(100),
    couleur_event VARCHAR(7),
    est_recurrent BOOLEAN DEFAULT FALSE,
    type_recurrence ENUM('quotidienne', 'hebdomadaire', 'mensuelle'),
    date_fin_recurrence DATETIME,
    id_cal INT,
    event_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cal) REFERENCES calendriers(id_cal) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS localisations (
    id_loc INT AUTO_INCREMENT PRIMARY KEY,
    lib_loc VARCHAR(200) NOT NULL,
    id_event INT,
    FOREIGN KEY (id_event) REFERENCES evenements(id_event) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id_notif INT AUTO_INCREMENT PRIMARY KEY,
    id_event INT,
    type_notif ENUM('rappel', 'annonce') NOT NULL,
    notif_lu_ou_non BOOLEAN DEFAULT FALSE,
    notif_lu_le TIMESTAMP,
    FOREIGN KEY (id_event) REFERENCES evenements(id_event) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS admins (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    nom_admin VARCHAR(50) NOT NULL,
    prenom_admin VARCHAR(50) NOT NULL,
    email_admin VARCHAR(100) NOT NULL UNIQUE,
    mdp_admin VARCHAR(255) NOT NULL,
    date_changement_mdp_admin TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    admin_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    grade_admin ENUM('superadmin', 'admin') DEFAULT 'admin',
    peut_voir_log_admin BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS logs (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    action_fait TEXT NOT NULL,
    realiser_par VARCHAR(100) NOT NULL,
    realiser_le VARCHAR(100) NOT NULL,
    id_admin INT,
    id_cal INT,
    id_class INT,
    id_user INT,
    id_event INT,
    id_droit INT,
    id_loc INT,
    id_notif INT,
    id_niveau INT,
    FOREIGN KEY (id_admin) REFERENCES admins(id_admin) ON DELETE SET NULL,
    FOREIGN KEY (id_cal) REFERENCES calendriers(id_cal) ON DELETE SET NULL,
    FOREIGN KEY (id_class) REFERENCES classes(id_class) ON DELETE SET NULL,
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL,
    FOREIGN KEY (id_event) REFERENCES evenements(id_event) ON DELETE SET NULL,
    FOREIGN KEY (id_droit) REFERENCES droits(id_droit) ON DELETE SET NULL,
    FOREIGN KEY (id_loc) REFERENCES localisations(id_loc) ON DELETE SET NULL,
    FOREIGN KEY (id_notif) REFERENCES notifications(id_notif) ON DELETE SET NULL,
    FOREIGN KEY (id_niveau) REFERENCES niveaux(id_niveau) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_droits (
    id_user INT,
    id_droit INT,
    PRIMARY KEY (id_user, id_droit),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_droit) REFERENCES droits(id_droit) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_classes (
    id_user INT,
    id_class INT,
    PRIMARY KEY (id_user, id_class),
    FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE,
    FOREIGN KEY (id_class) REFERENCES classes(id_class) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_notifications (
    id_event INT,
    id_notif INT,
    PRIMARY KEY (id_event, id_notif),
    FOREIGN KEY (id_event) REFERENCES evenements(id_event) ON DELETE CASCADE,
    FOREIGN KEY (id_notif) REFERENCES notifications(id_notif) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS droits_calendriers (
    id_droit INT,
    id_cal INT,
    PRIMARY KEY (id_droit, id_cal),
    FOREIGN KEY (id_droit) REFERENCES droits(id_droit) ON DELETE CASCADE,
    FOREIGN KEY (id_cal) REFERENCES calendriers(id_cal) ON DELETE CASCADE
);