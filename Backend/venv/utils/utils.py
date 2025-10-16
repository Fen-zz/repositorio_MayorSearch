# utils/utils.py
from passlib.context import CryptContext

# Crear un contexto de encriptación con bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Encripta una contraseña en texto plano."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compara una contraseña ingresada con su versión encriptada."""
    return pwd_context.verify(plain_password, hashed_password)
