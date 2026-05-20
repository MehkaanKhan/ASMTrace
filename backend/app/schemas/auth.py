from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str
    display_name: str = ""
    is_professor: bool = False


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    display_name: str | None
    is_professor: bool

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
