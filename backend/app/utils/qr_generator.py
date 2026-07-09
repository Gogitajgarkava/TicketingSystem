import qrcode
import os
from config import Config

def generate_ticket_qr(ticket_number):
    qr_dir = Config.QR_CODE_DIR
    os.makedirs(qr_dir, exist_ok=True)
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    
    qr.add_data(ticket_number)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    filename = f"{ticket_number}.png"
    path = os.path.join(qr_dir, filename)
    img.save(path)
    
    return f"/static/qrcodes/{filename}"