import os

# Get from your Twilio console
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

def send_sms_alert(message, to_number):
    if not ACCOUNT_SID or not AUTH_TOKEN:
        print("⚠️ Twilio credentials not configured. Skipping SMS.")
        return

    try:
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=TWILIO_PHONE,
            to=to_number
        )
        print(f"✅ SMS sent to {to_number}")
    except Exception as e:
        print(f"❌ Failed to send SMS: {e}")


