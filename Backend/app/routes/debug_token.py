# app/routes/debug_token.py   (temporal — borrarlo después de probar)
from fastapi import APIRouter
from app.utils.jwt_handler import create_access_token, verify_access_token

router = APIRouter(prefix="/debug", tags=["Debug"])

@router.get("/token")
def debug_token():
    # Genera un token de prueba con idusuario = 1
    token = create_access_token({"idusuario": 1, "sub": "test@example.com"})
    payload = verify_access_token(token)
    return {"token": token, "payload": payload}
