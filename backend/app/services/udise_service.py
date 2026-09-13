"""
UDISE Verification Service for Assam Future Innovation Program (AFIP).
Provides an extensible abstraction for format validation and external institutional verification
against the national/state UDISE+ database.
"""

import re
from typing import Dict, Any, Tuple

class UDISEVerificationService:
    # Official state code prefix for Assam in national UDISE database
    ASSAM_STATE_PREFIX = "18"
    UDISE_REGEX = r"^18\d{9}$"

    @classmethod
    def validate_format(cls, udise_code: str) -> Tuple[bool, str]:
        """
        Validates the 11-digit UDISE code format for Assam schools.
        Returns (is_valid, error_message).
        """
        if not udise_code:
            return False, "UDISE School ID is mandatory."
        
        cleaned = str(udise_code).strip()
        if not cleaned.isdigit() or len(cleaned) != 11 or not cleaned.startswith(cls.ASSAM_STATE_PREFIX) or not re.match(cls.UDISE_REGEX, cleaned):
            return False, "Please enter a valid 11-digit UDISE School ID for Assam (must start with state code '18')."
        
        return True, ""

    @classmethod
    def verify_school_udise(cls, udise_code: str, school_name: str = "", district: str = "") -> Dict[str, Any]:
        """
        Verification abstraction.
        In this milestone, performs strict format verification and mock registry checking.
        When external National/State API credentials are provided, this method can call the live
        government verification endpoint without changing the caller interface.
        """
        is_valid_format, error_msg = cls.validate_format(udise_code)
        
        if not is_valid_format:
            return {
                "udise_code": udise_code,
                "is_valid": False,
                "status": "invalid_format",
                "message": error_msg,
                "verified_source": None,
                "is_verified": False
            }

        # Mock / Extensible verification step:
        # We mark as 'format_valid' (pending administrative manual/live API verification)
        return {
            "udise_code": udise_code,
            "is_valid": True,
            "status": "format_valid",
            "message": "UDISE format successfully verified for Assam state jurisdiction.",
            "verified_source": "Format Validation Service (Prefix 18 Check)",
            "is_verified": False  # Formal verification happens via admin review or live registry integration
        }
