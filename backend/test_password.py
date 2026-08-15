from app.core.security import verify_password

hashed = "$2b$12$oqhaMm5jjBcuqfBpzpLH5.B.pXxdFJcSeG8E7yP02hlYQH/5lvb1e"

print(verify_password("testpassword123", hashed))