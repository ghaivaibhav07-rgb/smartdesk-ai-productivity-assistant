from app.schemas.user import UserCreate

user = UserCreate(
    name="Vaibhav",
    email="test@gmail.com"
)

print(user)