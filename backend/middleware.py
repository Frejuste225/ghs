"""Middleware personnalisés pour l'application GHS."""

import logging
import time
from typing import Callable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware pour la gestion centralisée des erreurs."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
        except HTTPException:
            # Laisser FastAPI gérer les HTTPException
            raise
        except SQLAlchemyError as e:
            logger.error(f"Erreur de base de données: {e}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Erreur de base de données",
                    "detail": "Une erreur est survenue lors de l'accès aux données"
                }
            )
        except ValueError as e:
            logger.error(f"Erreur de validation: {e}")
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Données invalides",
                    "detail": str(e)
                }
            )
        except Exception as e:
            logger.error(f"Erreur inattendue: {e}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Erreur interne du serveur",
                    "detail": "Une erreur inattendue s'est produite"
                }
            )


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware pour logger les requêtes."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Logger la requête entrante
        logger.info(f"Requête: {request.method} {request.url}")
        
        response = await call_next(request)
        
        # Logger la réponse
        process_time = time.time() - start_time
        logger.info(
            f"Réponse: {response.status_code} - "
            f"Temps: {process_time:.3f}s"
        )
        
        return response