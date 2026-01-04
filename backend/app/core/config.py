from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite:///./devolo.db"

    # Optional: base URL where your HLS streams are served.
    # Example with nginx-rtmp: http://localhost:8080/hls
    HLS_BASE_URL: str = "http://localhost:8080/hls"

    # Public base URL of this API (used to build playback URLs that proxy HLS through the API)
    PUBLIC_BASE_URL: str = "http://localhost:8000"

    JWT_SECRET: str = "CHANGE_ME_DEV_ONLY"
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_MINUTES: int = 20
    REFRESH_TOKEN_DAYS: int = 7
    REFRESH_TOKEN_DAYS_REMEMBER: int = 30

settings = Settings()
