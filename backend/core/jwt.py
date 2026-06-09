from datetime import datetime, timedelta
from jose import jwt
from db.session import SECRET_KEY, ALGORITHM

def create_access_token(data: dict, expires_delta:timedelta):
    to_encode = data.copy()
    expires = datetime.utcnow() + expires_delta
    to_encode.update({'exp': expires})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)