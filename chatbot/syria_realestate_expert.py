import time
import uuid

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)

# نفس قائمة النطاقات المسموحة المستخدمة بالـ Node API (server/index.js)
ALLOWED_ORIGINS = [
    "https://real-state-six-chi.vercel.app",
    "http://localhost:5173",
]
CORS(app, origins=ALLOWED_ORIGINS, methods=["GET", "POST", "OPTIONS"])

limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["60 per minute"],
    storage_uri="memory://",
)

# ── حماية الجلسات: سقف أقصى + انتهاء صلاحية (TTL) ─────────
SESSION_TTL_SECONDS = 30 * 60   # الجلسة تنتهي بعد 30 دقيقة بدون نشاط
MAX_SESSIONS = 2000             # سقف أقصى للجلسات المتزامنة بالذاكرة

sessions = {}  # session_id -> {"bot": SyriaRealEstateBot, "last_active": float}


def _cleanup_sessions():
    """يحذف الجلسات المنتهية الصلاحية، وإذا تجاوزنا السقف يحذف الأقدم نشاطاً."""
    now = time.time()
    expired = [sid for sid, s in sessions.items() if now - s["last_active"] > SESSION_TTL_SECONDS]
    for sid in expired:
        del sessions[sid]

    overflow = len(sessions) - MAX_SESSIONS
    if overflow > 0:
        oldest = sorted(sessions.items(), key=lambda kv: kv[1]["last_active"])[:overflow]
        for sid, _ in oldest:
            del sessions[sid]

# =============================================
# بيانات المحافظات والمناطق
# =============================================

GOVERNORATES = {
    "1":  {"name": "دمشق",      "areas": {"1": "المزة",          "2": "المالكي"}},
    "2":  {"name": "ريف دمشق", "areas": {"1": "جرمانا",          "2": "دوما"}},
    "3":  {"name": "حلب",       "areas": {"1": "العزيزية",        "2": "الشيخ سعيد"}},
    "4":  {"name": "حمص",       "areas": {"1": "الوعر",           "2": "كرم الزيتون"}},
    "5":  {"name": "حماة",      "areas": {"1": "طريق حلب",        "2": "القصور"}},
    "6":  {"name": "اللاذقية",  "areas": {"1": "الزراعة",         "2": "الرمل الجنوبي"}},
    "7":  {"name": "طرطوس",     "areas": {"1": "الشاطئ",          "2": "المحطة"}},
    "8":  {"name": "دير الزور", "areas": {"1": "الجورة",          "2": "القصور"}},
    "9":  {"name": "الرقة",     "areas": {"1": "الدرعية",         "2": "الرومية"}},
    "10": {"name": "الحسكة",    "areas": {"1": "غويران",          "2": "الناصرة"}},
    "11": {"name": "القنيطرة",  "areas": {"1": "خان أرنبة",       "2": "البعث"}},
    "12": {"name": "درعا",      "areas": {"1": "درعا البلد",      "2": "درعا المحطة"}},
    "13": {"name": "السويداء",  "areas": {"1": "شهبا",            "2": "صلخد"}},
    "14": {"name": "إدلب",      "areas": {"1": "أريحا",           "2": "معرة النعمان"}},
}

def build_gov_menu():
    lines = ["اختر المحافظة:"]
    for k, v in GOVERNORATES.items():
        lines.append(f"{k}. {v['name']}")
    return "\n".join(lines)

def build_area_menu(gov_key):
    gov = GOVERNORATES.get(gov_key)
    if not gov:
        return None
    lines = [f"اختر المنطقة في {gov['name']}:"]
    for k, v in gov["areas"].items():
        lines.append(f"{k}. {v}")
    return "\n".join(lines)

def valid_gov(key):
    return key in GOVERNORATES

def valid_area(gov_key, area_key):
    gov = GOVERNORATES.get(gov_key)
    return gov is not None and area_key in gov["areas"]

def get_area_name(gov_key, area_key):
    return GOVERNORATES[gov_key]["areas"][area_key]

def get_gov_name(gov_key):
    return GOVERNORATES[gov_key]["name"]


# =============================================
# State Machine (بديل عن experta)
# =============================================

class SyriaRealEstateBot:
    STATES = ["start", "main_option", "property_type", "governorate", "area", "price_range", "done"]

    def __init__(self):
        self.state = "start"
        self.data = {}
        self.last_response = None

    def process(self, user_input=None):
        """معالجة المدخل وإرجاع الرد المناسب"""

        # ── الترحيب
        if self.state == "start":
            self.state = "main_option"
            return self._ask(
                "مرحباً! 🏠 كيف أقدر أساعدك؟\n"
                "1. البحث عن عقار (شقة أو مزرعة)\n"
                "2. تواصل مع الدعم\n"
                "اختر رقم:"
            )

        # ── الخيار الرئيسي
        if self.state == "main_option":
            if user_input == "1":
                self.data["main_option"] = "1"
                self.state = "property_type"
                return self._ask(
                    "ما نوع العقار الذي تبحث عنه؟\n"
                    "1. شقة 🏢\n"
                    "2. مزرعة 🌿\n"
                    "اختر رقم:"
                )
            elif user_input == "2":
                self.state = "done"
                return self._ask(
                    "📞 للتواصل مع الدعم:\n"
                    "➡️ اضغط على 'تواصل معنا' في أسفل الصفحة\n"
                    "أو راسلنا على: support@syriaproperties.sy"
                )
            else:
                return self._ask(
                    "❌ خيار غير صحيح، من فضلك اختر 1 أو 2.\n"
                    "1. البحث عن عقار\n"
                    "2. تواصل مع الدعم"
                )

        # ── نوع العقار
        if self.state == "property_type":
            if user_input in ["1", "2"]:
                self.data["property_type"] = user_input
                self.state = "governorate"
                return self._ask(build_gov_menu())
            else:
                return self._ask(
                    "❌ خيار غير صحيح، من فضلك اختر 1 (شقة) أو 2 (مزرعة).\n"
                    "1. شقة 🏢\n"
                    "2. مزرعة 🌿"
                )

        # ── المحافظة
        if self.state == "governorate":
            if valid_gov(user_input):
                self.data["governorate"] = user_input
                self.state = "area"
                return self._ask(build_area_menu(user_input))
            else:
                return self._ask(
                    "❌ رقم غير صحيح، اختر من 1 إلى 14.\n" + build_gov_menu()
                )

        # ── المنطقة
        if self.state == "area":
            gov = self.data.get("governorate")
            if valid_area(gov, user_input):
                self.data["area"] = user_input
                self.state = "price_range"
                return self._ask(
                    "ما نطاق السعر المناسب لك (بالدولار)؟\n"
                    "1. أقل من 20,000 $\n"
                    "2. من 20,000 $ إلى 50,000 $\n"
                    "3. من 50,000 $ إلى 100,000 $\n"
                    "4. أكثر من 100,000 $\n"
                    "اختر رقم:"
                )
            else:
                return self._ask(
                    "❌ رقم غير صحيح، اختر 1 أو 2.\n" + build_area_menu(gov)
                )

        # ── نطاق السعر والنتيجة
        if self.state == "price_range":
            if user_input in ["1", "2", "3", "4"]:
                self.data["price_range"] = user_input
                self.state = "done"
                return self._show_results()
            else:
                return self._ask(
                    "❌ اختيار غير صحيح، اختر من 1 إلى 4.\n"
                    "1. أقل من 20,000 $\n"
                    "2. من 20,000 $ إلى 50,000 $\n"
                    "3. من 50,000 $ إلى 100,000 $\n"
                    "4. أكثر من 100,000 $"
                )

        # ── انتهى
        return self._ask("✅ تمت عملية البحث. يمكنك إعادة التعيين لبدء بحث جديد.")

    def _ask(self, text):
        self.last_response = text
        return text

    def _show_results(self):
        price_labels = {
            "1": "أقل من 20,000 $",
            "2": "20,000 $ - 50,000 $",
            "3": "50,000 $ - 100,000 $",
            "4": "أكثر من 100,000 $"
        }
        pt  = self.data.get("property_type")
        gov = self.data.get("governorate")
        area = self.data.get("area")
        pr  = self.data.get("price_range")

        type_label  = "شقة 🏢" if pt == "1" else "مزرعة 🌿"
        gov_name    = get_gov_name(gov)
        area_name   = get_area_name(gov, area)
        price_label = price_labels[pr]

        result = (
            f"✅ ممتاز! إليك نتائج البحث:\n"
            f"🏠 النوع: {type_label}\n"
            f"📍 المحافظة: {gov_name}\n"
            f"🗺️  المنطقة: {area_name}\n"
            f"💵 نطاق السعر: {price_label}\n\n"
            f"➡️ ستظهر لك قائمة العقارات المتاحة في صفحة النتائج.\n"
            f"➡️ اضغط على 'عرض التفاصيل' لأي عقار لترى المزيد.\n"
            f"➡️ اضغط 'تواصل مع المالك' إذا أعجبك العقار. 🎉"
        )
        return self._ask(result)


# =============================================
# Flask Routes
# =============================================

@app.route('/chatbot', methods=['POST'])
@limiter.limit("20 per minute")
def chatbot():
    _cleanup_sessions()

    data = request.get_json(silent=True) or {}
    session_id = data.get('session_id')
    user_input = data.get('user_input', '')

    # جلسة جديدة — دائماً بمعرّف يولّده السيرفر (uuid4)، ما منوثق بمعرّف يبعته العميل
    if not session_id or session_id not in sessions:
        session_id = uuid.uuid4().hex
        bot = SyriaRealEstateBot()
        sessions[session_id] = {"bot": bot, "last_active": time.time()}
        response = bot.process()
        return jsonify({
            "session_id": session_id,
            "response": response
        })

    entry = sessions[session_id]
    entry["last_active"] = time.time()
    response = entry["bot"].process(user_input)

    return jsonify({
        "session_id": session_id,
        "response": response
    })


@app.route('/reset', methods=['POST'])
@limiter.limit("20 per minute")
def reset_session():
    data = request.get_json(silent=True) or {}
    session_id = data.get('session_id')
    if session_id and session_id in sessions:
        del sessions[session_id]
    return jsonify({"message": "تمت إعادة التعيين ✅"})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "running", "sessions": len(sessions)})


if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=False, host='0.0.0.0', port=port)