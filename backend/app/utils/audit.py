from datetime import datetime, timezone
from app.utils.db import get_db, parse_object_id

def log_audit_event(actor_id, actor_role, action, resource_type, resource_id=None, metadata=None):
    """
    Log sensitive actions to the audit_logs collection.
    Standard fields: actor_id, actor_role, action, target_type, target_id, timestamp, metadata
    """
    try:
        db = get_db()
        now = datetime.now(timezone.utc)
        doc = {
            "actor_id": str(actor_id) if actor_id else None,
            "actor_role": (actor_role or "SYSTEM").upper(),
            "action": action,
            "resource_type": resource_type,
            "target_type": resource_type,
            "resource_id": str(resource_id) if resource_id else None,
            "target_id": str(resource_id) if resource_id else None,
            "metadata": metadata or {},
            "timestamp": now
        }
        db.audit_logs.insert_one(doc)
    except Exception as e:
        print(f"[AUDIT LOG ERROR] Failed to record audit log: {e}")
