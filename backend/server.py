from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import base64
from passlib.context import CryptContext
import jwt
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============= MODELS =============

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str

class FamilyCreate(BaseModel):
    name: str

class Family(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FamilyMemberCreate(BaseModel):
    first_name: str
    last_name: str
    address: Optional[str] = None
    birthday: Optional[str] = None  # Format: YYYY-MM-DD
    anniversary: Optional[str] = None  # Format: YYYY-MM-DD
    comments: Optional[str] = None
    parent_id: Optional[str] = None  # For hierarchy
    photo_base64: Optional[str] = None

class FamilyMemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    birthday: Optional[str] = None
    anniversary: Optional[str] = None
    comments: Optional[str] = None
    parent_id: Optional[str] = None
    photo_base64: Optional[str] = None

class FamilyMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    family_id: str
    first_name: str
    last_name: str
    address: Optional[str] = None
    photo_base64: Optional[str] = None
    birthday: Optional[str] = None
    anniversary: Optional[str] = None
    comments: Optional[str] = None
    parent_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CustomEventCreate(BaseModel):
    event_name: str
    event_date: str  # Format: YYYY-MM-DD
    member_id: Optional[str] = None

class CustomEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    family_id: str
    member_id: Optional[str] = None
    event_name: str
    event_date: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Alert(BaseModel):
    type: str  # 'birthday', 'anniversary', 'custom'
    title: str
    date: str
    member_name: Optional[str] = None
    days_until: int

class EmailNotificationRequest(BaseModel):
    email: EmailStr
    family_id: str

# ============= AUTH =============

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    # Universal login credentials
    if request.username == "onefam" and request.password == "Welcome1":
        token = jwt.encode({"username": request.username}, SECRET_KEY, algorithm=ALGORITHM)
        return LoginResponse(token=token, message="Login successful")
    raise HTTPException(status_code=401, detail="Invalid credentials")

# ============= FAMILIES =============

@api_router.get("/families", response_model=List[Family])
async def get_families():
    families = await db.families.find({}, {"_id": 0}).to_list(1000)
    for family in families:
        if isinstance(family.get('created_at'), str):
            family['created_at'] = datetime.fromisoformat(family['created_at'])
    return families

@api_router.post("/families", response_model=Family)
async def create_family(family_data: FamilyCreate):
    family = Family(**family_data.model_dump())
    doc = family.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.families.insert_one(doc)
    return family

@api_router.delete("/families/{family_id}")
async def delete_family(family_id: str):
    # Delete all members and events of the family first
    await db.family_members.delete_many({"family_id": family_id})
    await db.custom_events.delete_many({"family_id": family_id})
    result = await db.families.delete_one({"id": family_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Family not found")
    return {"message": "Family deleted successfully"}

# ============= FAMILY MEMBERS =============

@api_router.get("/families/{family_id}/members", response_model=List[FamilyMember])
async def get_family_members(family_id: str):
    members = await db.family_members.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    for member in members:
        if isinstance(member.get('created_at'), str):
            member['created_at'] = datetime.fromisoformat(member['created_at'])
    return members

@api_router.post("/families/{family_id}/members", response_model=FamilyMember)
async def create_family_member(family_id: str, member_data: FamilyMemberCreate):
    # Verify family exists
    family = await db.families.find_one({"id": family_id}, {"_id": 0})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    
    member = FamilyMember(family_id=family_id, **member_data.model_dump())
    doc = member.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.family_members.insert_one(doc)
    return member

@api_router.put("/families/{family_id}/members/{member_id}", response_model=FamilyMember)
async def update_family_member(family_id: str, member_id: str, member_data: FamilyMemberUpdate):
    # Get existing member
    existing = await db.family_members.find_one({"id": member_id, "family_id": family_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Update only provided fields
    update_data = {k: v for k, v in member_data.model_dump().items() if v is not None}
    if update_data:
        await db.family_members.update_one({"id": member_id}, {"$set": update_data})
    
    # Return updated member
    updated = await db.family_members.find_one({"id": member_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return FamilyMember(**updated)

@api_router.delete("/families/{family_id}/members/{member_id}")
async def delete_family_member(family_id: str, member_id: str):
    result = await db.family_members.delete_one({"id": member_id, "family_id": family_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member deleted successfully"}

# ============= CUSTOM EVENTS =============

@api_router.get("/families/{family_id}/events", response_model=List[CustomEvent])
async def get_custom_events(family_id: str, month: Optional[int] = None, year: Optional[int] = None):
    query = {"family_id": family_id}
    events = await db.custom_events.find(query, {"_id": 0}).to_list(1000)
    
    # Filter by month/year if provided
    if month or year:
        filtered_events = []
        for event in events:
            event_date = datetime.strptime(event['event_date'], '%Y-%m-%d')
            if month and event_date.month != month:
                continue
            if year and event_date.year != year:
                continue
            filtered_events.append(event)
        events = filtered_events
    
    for event in events:
        if isinstance(event.get('created_at'), str):
            event['created_at'] = datetime.fromisoformat(event['created_at'])
    return events

@api_router.post("/families/{family_id}/events", response_model=CustomEvent)
async def create_custom_event(family_id: str, event_data: CustomEventCreate):
    # Verify family exists
    family = await db.families.find_one({"id": family_id}, {"_id": 0})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    
    event = CustomEvent(family_id=family_id, **event_data.model_dump())
    doc = event.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.custom_events.insert_one(doc)
    return event

@api_router.delete("/families/{family_id}/events/{event_id}")
async def delete_custom_event(family_id: str, event_id: str):
    result = await db.custom_events.delete_one({"id": event_id, "family_id": family_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"message": "Event deleted successfully"}

# ============= ALERTS =============

@api_router.get("/families/{family_id}/alerts", response_model=List[Alert])
async def get_alerts(family_id: str):
    alerts = []
    today = datetime.now(timezone.utc)
    
    # Get all family members
    members = await db.family_members.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    
    for member in members:
        member_name = f"{member.get('first_name', '')} {member.get('last_name', '')}"
        
        # Check birthday
        if member.get('birthday'):
            try:
                bday = datetime.strptime(member['birthday'], '%Y-%m-%d')
                # Get this year's birthday
                this_year_bday = bday.replace(year=today.year)
                if this_year_bday < today:
                    this_year_bday = bday.replace(year=today.year + 1)
                
                days_until = (this_year_bday - today).days
                if 0 <= days_until <= 30:  # Alert for next 30 days
                    alerts.append(Alert(
                        type="birthday",
                        title=f"{member_name}'s Birthday",
                        date=this_year_bday.strftime('%Y-%m-%d'),
                        member_name=member_name,
                        days_until=days_until
                    ))
            except:
                pass
        
        # Check anniversary
        if member.get('anniversary'):
            try:
                anniv = datetime.strptime(member['anniversary'], '%Y-%m-%d')
                this_year_anniv = anniv.replace(year=today.year)
                if this_year_anniv < today:
                    this_year_anniv = anniv.replace(year=today.year + 1)
                
                days_until = (this_year_anniv - today).days
                if 0 <= days_until <= 30:
                    alerts.append(Alert(
                        type="anniversary",
                        title=f"{member_name}'s Anniversary",
                        date=this_year_anniv.strftime('%Y-%m-%d'),
                        member_name=member_name,
                        days_until=days_until
                    ))
            except:
                pass
    
    # Check custom events
    events = await db.custom_events.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    for event in events:
        try:
            event_date = datetime.strptime(event['event_date'], '%Y-%m-%d')
            days_until = (event_date - today).days
            if 0 <= days_until <= 30:
                alerts.append(Alert(
                    type="custom",
                    title=event['event_name'],
                    date=event['event_date'],
                    member_name=None,
                    days_until=days_until
                ))
        except:
            pass
    
    # Sort by days_until
    alerts.sort(key=lambda x: x.days_until)
    return alerts

# ============= EMAIL NOTIFICATIONS =============

async def send_email_notification(to_email: str, subject: str, content: str):
    """Send email notification using SendGrid"""
    sendgrid_key = os.getenv('SENDGRID_API_KEY')
    sender_email = os.getenv('SENDER_EMAIL', 'noreply@onefam.com')
    
    if not sendgrid_key:
        logging.warning("SendGrid API key not configured")
        return False
    
    try:
        message = Mail(
            from_email=sender_email,
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        sg = SendGridAPIClient(sendgrid_key)
        response = sg.send(message)
        return response.status_code == 202
    except Exception as e:
        logging.error(f"Failed to send email: {str(e)}")
        return False

@api_router.post("/families/{family_id}/send-alerts")
async def send_alert_emails(family_id: str, request: EmailNotificationRequest, background_tasks: BackgroundTasks):
    """Send email alerts for upcoming events (1 day before)"""
    today = datetime.now(timezone.utc)
    tomorrow = today + timedelta(days=1)
    
    alerts_to_send = []
    
    # Get all family members
    members = await db.family_members.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    
    for member in members:
        member_name = f"{member.get('first_name', '')} {member.get('last_name', '')}"
        
        # Check birthday (tomorrow)
        if member.get('birthday'):
            try:
                bday = datetime.strptime(member['birthday'], '%Y-%m-%d')
                this_year_bday = bday.replace(year=today.year)
                if this_year_bday.date() == tomorrow.date():
                    alerts_to_send.append({
                        'type': 'Birthday',
                        'name': member_name,
                        'date': this_year_bday.strftime('%B %d, %Y')
                    })
            except:
                pass
        
        # Check anniversary (tomorrow)
        if member.get('anniversary'):
            try:
                anniv = datetime.strptime(member['anniversary'], '%Y-%m-%d')
                this_year_anniv = anniv.replace(year=today.year)
                if this_year_anniv.date() == tomorrow.date():
                    alerts_to_send.append({
                        'type': 'Anniversary',
                        'name': member_name,
                        'date': this_year_anniv.strftime('%B %d, %Y')
                    })
            except:
                pass
    
    # Check custom events (tomorrow)
    events = await db.custom_events.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    for event in events:
        try:
            event_date = datetime.strptime(event['event_date'], '%Y-%m-%d')
            if event_date.date() == tomorrow.date():
                alerts_to_send.append({
                    'type': 'Event',
                    'name': event['event_name'],
                    'date': event_date.strftime('%B %d, %Y')
                })
        except:
            pass
    
    if alerts_to_send:
        # Build email content
        email_content = "<html><body><h2>Upcoming Events Reminder</h2><p>The following events are happening tomorrow:</p><ul>"
        for alert in alerts_to_send:
            email_content += f"<li><strong>{alert['type']}</strong>: {alert['name']} on {alert['date']}</li>"
        email_content += "</ul><p>Don't forget to celebrate!</p></body></html>"
        
        # Send email in background
        background_tasks.add_task(
            send_email_notification,
            request.email,
            "OneFam - Upcoming Events Reminder",
            email_content
        )
        
        return {"message": f"Email notification queued for {len(alerts_to_send)} event(s)"}
    
    return {"message": "No events happening tomorrow"}

# ============= EVENTS BY MONTH/YEAR =============

@api_router.get("/families/{family_id}/events-calendar")
async def get_events_calendar(family_id: str, month: Optional[int] = None, year: Optional[int] = None):
    """Get all birthdays, anniversaries, and custom events for a specific month/year"""
    events_list = []
    
    # Get all family members
    members = await db.family_members.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    
    for member in members:
        member_name = f"{member.get('first_name', '')} {member.get('last_name', '')}"
        
        # Birthdays
        if member.get('birthday'):
            try:
                bday = datetime.strptime(member['birthday'], '%Y-%m-%d')
                if (not month or bday.month == month) and (not year or bday.year == year):
                    events_list.append({
                        'type': 'birthday',
                        'title': f"{member_name}'s Birthday",
                        'date': member['birthday'],
                        'member_id': member['id'],
                        'member_name': member_name
                    })
            except:
                pass
        
        # Anniversaries
        if member.get('anniversary'):
            try:
                anniv = datetime.strptime(member['anniversary'], '%Y-%m-%d')
                if (not month or anniv.month == month) and (not year or anniv.year == year):
                    events_list.append({
                        'type': 'anniversary',
                        'title': f"{member_name}'s Anniversary",
                        'date': member['anniversary'],
                        'member_id': member['id'],
                        'member_name': member_name
                    })
            except:
                pass
    
    # Custom events
    events = await db.custom_events.find({"family_id": family_id}, {"_id": 0}).to_list(1000)
    for event in events:
        try:
            event_date = datetime.strptime(event['event_date'], '%Y-%m-%d')
            if (not month or event_date.month == month) and (not year or event_date.year == year):
                events_list.append({
                    'type': 'custom',
                    'title': event['event_name'],
                    'date': event['event_date'],
                    'event_id': event['id']
                })
        except:
            pass
    
    # Sort by date
    events_list.sort(key=lambda x: x['date'])
    return events_list

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()