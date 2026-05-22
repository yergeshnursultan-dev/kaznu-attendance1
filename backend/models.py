from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Teacher(Base):
    __tablename__ = "teachers"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    group_name = Column(String, nullable=False)
    room = Column(String, default="Ауд. 301")
    schedule_time = Column(String, default="09:00 – 10:30")


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True)
    student_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    group_name = Column(String, nullable=False)
    face_embedding = Column(String, nullable=True)
    records = relationship("AttendanceRecord", back_populates="student")


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=True)
    status = Column(String, default="absent")
    confidence = Column(Float, nullable=True)
    method = Column(String, default="auto")
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    student = relationship("Student", back_populates="records")
