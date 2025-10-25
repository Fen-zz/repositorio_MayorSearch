from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request

# Clave secreta (en producción debería venir de variables de entorno)
SECRET_KEY = "clave_super_secreta_para_operacion_calabaza"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Duración del token (1 día)

# --- Crear token ---
def create_reset_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Verificar token de recuperación ---
def verify_reset_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

# --- Crear token de acceso ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Verificar token de acceso (Bearer) ---
def verify_access_token(token_or_request=None):
    """
    Verifica el JWT. Acepta tanto un Request (para Depends) como un token string (para llamadas internas).
    """
    token = None

    # Caso 1: viene un objeto Request (desde Depends)
    from fastapi import Request
    if isinstance(token_or_request, Request):
        auth_header = token_or_request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token no proporcionado o formato inválido",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = auth_header.split(" ")[1]

    # Caso 2: viene un string directo (desde otras funciones)
    elif isinstance(token_or_request, str):
        token = token_or_request

    # Caso 3: nada válido
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no recibido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

