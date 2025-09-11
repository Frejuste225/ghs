"""Module de gestion de la base de données."""

import logging
from typing import Generator
from urllib.parse import quote_plus
from sqlmodel import Session, create_engine, text


class Database:
    """Classe de gestion de la base de données MySQL."""
    
    def __init__(self, db_user: str, db_password: str, db_host: str, db_port: int, db_name: str):
        """
        Initialise la connexion à la base de données.
        
        Args:
            db_user: Nom d'utilisateur de la base de données
            db_password: Mot de passe de la base de données
            db_host: Adresse du serveur de base de données
            db_port: Port de connexion
            db_name: Nom de la base de données
        """
        self.db_user = db_user
        self.db_password = db_password
        self.db_host = db_host
        self.db_port = db_port
        self.db_name = db_name
        
        # Construction de l'URL de connexion avec encodage du mot de passe
        encoded_password = quote_plus(db_password) if db_password else ""
        self.database_url = (
            f"mysql+mysqlconnector://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}"
        )
        
        # Création du moteur de base de données
        self.engine = create_engine(
            self.database_url,
            echo=False,  # Mettre à True pour voir les requêtes SQL
            pool_pre_ping=True,  # Vérification de la connexion avant utilisation
            pool_recycle=300,  # Renouvellement des connexions toutes les 5 minutes
            pool_size=10,  # Taille du pool de connexions
            max_overflow=20  # Connexions supplémentaires autorisées
        )
        
        # Logger pour les opérations de base de données
        self.logger = logging.getLogger(__name__)
    
    def start(self) -> bool:
        """
        Connexion à la base de données.
        
        Returns:
            bool: True si la connexion fonctionne, False sinon
        """
        try:
            with Session(self.engine) as session:
                session.exec(text("SELECT 1"))
                self.logger.info("Connexion à la base de données réussie")
                return True
        except Exception as e:
            self.logger.error("Échec de la connexion à la base de données: %s", e)
            return False
    
    def get_session(self) -> Generator[Session, None, None]:
        """
        Générateur de session pour les opérations de base de données.
        
        Yields:
            Session: Session SQLModel avec gestion automatique des erreurs
        """
        with Session(self.engine) as session:
            try:
                yield session
                session.commit()  # Commit automatique si pas d'erreur
            except Exception as e:
                session.rollback()
                self.logger.error("Erreur de session, rollback effectué: %s", e)
                raise
            finally:
                session.close()
    
    def close(self):
        """
        Ferme la connexion à la base de données.
        """
        if self.engine:
            self.engine.dispose()
            self.logger.info("Connexion fermée")