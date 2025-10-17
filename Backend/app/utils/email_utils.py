#from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
#from pydantic import EmailStr
#import os

# Configura tu conexión
#conf = ConnectionConfig(
    #MAIL_USERNAME="fakenightmarez@gmail.com",
    #MAIL_PASSWORD="rvdsgvefhywzutzh",  
    #MAIL_FROM="fakenightmarez@gmail.com",
    #MAIL_PORT=587,
    #MAIL_SERVER="smtp.gmail.com",
    #MAIL_STARTTLS=True,
    #MAIL_SSL_TLS=False,
    #USE_CREDENTIALS=True
#)

# Función para enviar correo de restablecimiento
#async def send_reset_email(email_to: EmailStr, token: str):
    #link = f"http://127.0.0.1:8000/reset-password?token={token}"
    #message = MessageSchema(
        #subject="Restablecimiento de contraseña - MayorSearch",
        #recipients=[email_to],
        #body=f"Hola, haz clic en el siguiente enlace para restablecer tu contraseña:\n{link}",
        #subtype="plain"
    #)
    #fm = FastMail(conf)
    #await fm.send_message(message)
