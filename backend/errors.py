from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class ApiError(Exception):
    code: str
    message: str
    status_code: int
    details: dict[str, object] = field(default_factory=dict)

    def to_payload(self, request_id: str) -> dict[str, object]:
        return {
            "error": {
                "code": self.code,
                "message": self.message,
                "details": self.details,
                "request_id": request_id,
            }
        }
