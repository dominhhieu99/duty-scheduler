from fastapi import FastAPI, Depends
from datetime import date, timedelta
import uvicorn
from sqlalchemy import create_engine, Column, String, Date, Boolean, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Kết nối CSDL cục bộ
SQLALCHEMY_DATABASE_URL = "sqlite:///./schedule.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# === BẢNG DỮ LIỆU ===
class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    role_type = Column(String)
    is_admin = Column(Boolean, default=False)

class ShiftDB(Base):
    __tablename__ = "schedule"
    id = Column(Integer, primary_key=True, autoincrement=True)
    work_date = Column(Date, nullable=False)
    user_id = Column(String, nullable=False)
    shift_type = Column(String, nullable=False)

class UnavailableDB(Base):
    __tablename__ = "unavailable"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    reason = Column(String, default="")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lịch Trực Cảnh Báo")

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

SHIFT_COLORS = {
    "MIDDAY SHIFT": "#4285F4",
    "OFFLINE": "#34A853",
    "UPCODE": "#FBBC05",
    "ONLINE": "#F2994A",
    "OFFLINE (U)": "#9AA0A6"
}

# === API ===
@app.get("/api/health")
def health():
    return {"status": "ok", "mode": "offline-local"}

@app.get("/api/users")
def list_users(db=Depends(get_db)):
    users = db.query(UserDB).all()
    return [{"id": u.id, "name": u.name, "phone": u.phone, "role_type": u.role_type, "is_admin": u.is_admin} for u in users]

@app.get("/api/schedule/{year}/{month}")
def get_schedule(year: int, month: int, db=Depends(get_db)):
    start = date(year, month, 1)
    if month == 12:
        end = date(year+1, 1, 1) - timedelta(days=1)
    else:
        end = date(year, month+1, 1) - timedelta(days=1)
    
    all_days, cur = [], start
    while cur <= end:
        all_days.append(cur)
        cur += timedelta(days=1)
    
    shifts = db.query(ShiftDB).filter(
        ShiftDB.work_date >= start, ShiftDB.work_date <= end
    ).all()
    shift_map = {(s.work_date.isoformat(), s.user_id): s.shift_type for s in shifts}
    
    unavails = db.query(UnavailableDB).all()
    unavail_map = {(u.date.isoformat(), u.user_id): True for u in unavails}
    
    return {
        "days": [d.isoformat() for d in all_days],
        "day_names": [["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.weekday()] for d in all_days],
        "schedule": shift_map,
        "unavailable": unavail_map,
        "shift_colors": SHIFT_COLORS
    }

@app.put("/api/schedule/update")
def update_schedule(data: dict, db=Depends(get_db)):
    wd = date.fromisoformat(data["work_date"])
    rec = db.query(ShiftDB).filter(
        ShiftDB.work_date == wd, ShiftDB.user_id == data["user_id"]
    ).first()
    if rec:
        rec.shift_type = data["shift_type"]
    else:
        db.add(ShiftDB(work_date=wd, user_id=data["user_id"], shift_type=data["shift_type"]))
    db.commit()
    return {"ok": True}

@app.post("/api/unavailable")
def register_unavailable(data: dict, db=Depends(get_db)):
    db.add(UnavailableDB(
        user_id=data["user_id"],
        date=date.fromisoformat(data["date"]),
        reason=data.get("reason", "")
    ))
    db.commit()
    return {"ok": True}

# === KHỞI TẠO DỮ LIỆU MẪU ===
@app.on_event("startup")
def init_sample():
    db = SessionLocal()
    if not db.query(UserDB).first():
        sample_users = [
            {"id": "hieudm5", "name": "hieudm5 (FO)", "phone": "0386138509", "role_type": "FO", "is_admin": True},
            {"id": "minhq27", "name": "minhq27 (FO)", "phone": "0977139946", "role_type": "FO", "is_admin": False},
            {"id": "bonv6", "name": "bonv6 (FO)", "phone": "0348845924", "role_type": "FO", "is_admin": False},
            {"id": "huynq196", "name": "huynq196 (FO)", "phone": "0366871219", "role_type": "FO", "is_admin": False},
            {"id": "linhch", "name": "linhch (BO)", "phone": "0333984335", "role_type": "BO", "is_admin": False},
            {"id": "dongnx1", "name": "dongnx1 (BO)", "phone": "0973458536", "role_type": "BO", "is_admin": False},
            {"id": "minhhb", "name": "minhhb (BO)", "phone": "0336084616", "role_type": "BO", "is_admin": False},
            {"id": "manhlt10", "name": "manhlt10 (BO)", "phone": "0346277771", "role_type": "BO", "is_admin": False},
            {"id": "congdd", "name": "congdd (BO)", "phone": "0377199678", "role_type": "BO", "is_admin": False},
            {"id": "huytq35", "name": "huytq35 (BO)", "phone": "0329698903", "role_type": "BO", "is_admin": False},
            {"id": "vietbd5", "name": "vietbd5 (BO)", "phone": "0986273028", "role_type": "BO", "is_admin": False},
            {"id": "thanht67", "name": "thanht67 (BO)", "phone": "0366465830", "role_type": "BO", "is_admin": False},
        ]
        for u in sample_users:
            db.add(UserDB(**u))
        db.commit()
    db.close()

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
