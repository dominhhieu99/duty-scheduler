from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta
import uvicorn
from calendar import monthrange
from sqlalchemy import create_engine, Column, String, Date, Boolean, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

# === CẤU HÌNH CSDL ===
SQLALCHEMY_DATABASE_URL = "sqlite:///./schedule.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)
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

# === QUẢN LÝ KẾT NỐI CSDL ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === KHỞI TẠO APP ===
app = FastAPI(title="Lịch Trực Cảnh Báo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SHIFT_COLORS = {
    "MIDDAY SHIFT": "#4285F4",
    "OFFLINE": "#34A853",
    "UPCODE": "#FBBC05",
    "ONLINE": "#F2994A",
    "OFFLINE (U)": "#9AA0A6"
}

# === KHỞI TẠO DỮ LIỆU MẪU ===
def init_db():
    db = SessionLocal()
    try:
        if db.query(UserDB).count() == 0:
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
            print("✅ Đã tạo 12 nhân viên mẫu")
    finally:
        db.close()

init_db()

# === API ===
@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    try:
        users = db.query(UserDB).order_by(UserDB.role_type.desc(), UserDB.name).all()
        return [{"id": u.id, "name": u.name, "phone": u.phone, "role_type": u.role_type, "is_admin": u.is_admin} for u in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi đọc users: {str(e)}")

@app.get("/api/schedule/{year}/{month}")
def get_schedule(year: int, month: int, db: Session = Depends(get_db)):
    try:
        last_day = monthrange(year, month)[1]
        start = date(year, month, 1)
        end = date(year, month, last_day)
        
        all_days = []
        cur = start
        while cur <= end:
            all_days.append(cur)
            cur += timedelta(days=1)
        
        shifts = db.query(ShiftDB).filter(
            ShiftDB.work_date >= start,
            ShiftDB.work_date <= end
        ).all()
        
        shift_map = {}
        for s in shifts:
            key = f"{s.work_date.isoformat()}|{s.user_id}"
            shift_map[key] = s.shift_type
        
        unavails = db.query(UnavailableDB).all()
        unavail_map = {}
        for u in unavails:
            unavail_map[f"{u.date.isoformat()}|{u.user_id}"] = True
        
        return {
            "days": [d.isoformat() for d in all_days],
            "day_names": [["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.weekday()] for d in all_days],
            "schedule": shift_map,
            "unavailable": unavail_map,
            "shift_colors": SHIFT_COLORS
        }
    except Exception as e:
        print(f"❌ Lỗi lấy lịch: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi lấy lịch: {str(e)}")

@app.put("/api/schedule/update")
def update_schedule(data: dict, db: Session = Depends(get_db)):
    try:
        work_date = date.fromisoformat(data["work_date"])
        user_id = data["user_id"]
        shift_type = data["shift_type"]
        
        rec = db.query(ShiftDB).filter(
            ShiftDB.work_date == work_date,
            ShiftDB.user_id == user_id
        ).first()
        
        if rec:
            rec.shift_type = shift_type
            print(f"✅ CẬP NHẬT: {work_date} | {user_id} → {shift_type}")
        else:
            db.add(ShiftDB(work_date=work_date, user_id=user_id, shift_type=shift_type))
            print(f"✅ TẠO MỚI: {work_date} | {user_id} → {shift_type}")
        
        db.commit()
        return {"ok": True, "message": "Lưu thành công"}
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi lưu lịch: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi lưu: {str(e)}")

@app.post("/api/unavailable")
def register_unavailable(data: dict, db: Session = Depends(get_db)):
    try:
        db.add(UnavailableDB(
            user_id=data["user_id"],
            date=date.fromisoformat(data["date"]),
            reason=data.get("reason", "")
        ))
        db.commit()
        print(f"✅ Đăng ký bận: {data['date']} | {data['user_id']}")
        return {"ok": True}
    except Exception as e:
        db.rollback()
        print(f"❌ Lỗi đăng ký bận: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
