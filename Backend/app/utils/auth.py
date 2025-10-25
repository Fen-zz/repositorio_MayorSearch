# app/utils/auth.py
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.jwt_handler import verify_access_token
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.usuario import Usuario

security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> int:
    """
    Dependencia que devuelve el idusuario del token 'access_token'.
    Usa HTTPBearer para que Swagger muestre 'Authorize'.
    """
    token = credentials.credentials  # ya viene sin 'Bearer '
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    user_id = payload.get("idusuario")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token inválido: falta idusuario")
    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(status_code=401, detail="idusuario inválido en token")

    # (Opcional pero recomendado) verificar que el usuario exista en la BD
    user = db.query(Usuario).filter(Usuario.idusuario == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no existe")
    return user_id
