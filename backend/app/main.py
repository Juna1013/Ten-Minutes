from collections.abc import Generator
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, FastAPI, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Field, Session, SQLModel, create_engine, select

TARGET_TIME = 10.0
DATABASE_URL = "sqlite:///records.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

class RecordCreate(SQLModel):
    elapsed_time: float = Field(gt=0, le=60)

class Record(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    elapsed_time: float
    difference: float = Field(index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )

class RecordPublic(SQLModel):
    id: int
    elapsed_time: float
    difference: float
    created_at: datetime

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(
    title="Ten Seconds Game API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post(
    "/records",
    response_model=RecordPublic,
    status_code=status.HTTP_201_CREATED,
)
def create_record(
    record_data: RecordCreate,
    session: SessionDep,
):
    difference = abs(TARGET_TIME - record_data.elapsed_time)

    record = Record(
        elapsed_time=record_data.elapsed_time,
        difference=difference,
    )

    session.add(record)
    session.commit()
    session.refresh(record)

    return record

@app.get("/records", response_model=list[RecordPublic])
def read_records(
    session: SessionDep,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):

    statement = (
        select(Record)
        .order_by(Record.difference)
        .limit(limit)
    )

    return list(session.exec(statement).all())