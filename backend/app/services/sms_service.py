"""
Twilio SMS integration (thesis section 4.6.1). Falls back to a console-log
stub when TWILIO_* env vars aren't configured, so the rest of the app is
runnable without a Twilio account during development.
"""
from flask import current_app

try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException
except ImportError:  # twilio not installed yet
    Client = None
    TwilioRestException = Exception


ALERT_TEMPLATES = {
    "Low": "FRPEWS: Flood risk is LOW in {location}. No action needed at this time.",
    "Moderate": "FRPEWS: Flood risk is MODERATE in {location}. Stay alert to updates.",
    "High": ("FLOOD ALERT - HIGH RISK: {location}. River levels are rising rapidly. "
             "Risk is expected to remain HIGH for the next 48 hours. Prepare for "
             "possible evacuation. Monitor official channels. - FRPEWS"),
    "Extreme": ("FLOOD ALERT - EXTREME RISK: {location}. Immediate danger of severe "
                "flooding. Evacuate to higher ground now if advised by local "
                "authorities. - FRPEWS"),
}


def build_alert_message(risk_level, location, trend="stable"):
    template = ALERT_TEMPLATES.get(risk_level, ALERT_TEMPLATES["Moderate"])
    return template.format(location=location, trend=trend)


def send_sms(to_number, message):
    """Returns 'delivered', 'failed', or 'stub_logged' (no Twilio credentials configured)."""
    sid = current_app.config.get("TWILIO_ACCOUNT_SID")
    token = current_app.config.get("TWILIO_AUTH_TOKEN")
    from_number = current_app.config.get("TWILIO_FROM_NUMBER")

    if not (Client and sid and token and from_number):
        current_app.logger.info(f"[SMS STUB] to={to_number} message={message!r}")
        return "stub_logged"

    try:
        client = Client(sid, token)
        client.messages.create(to=to_number, from_=from_number, body=message)
        return "delivered"
    except TwilioRestException as e:
        current_app.logger.error(f"Twilio send failed: {e}")
        return "failed"
