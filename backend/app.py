from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from fpdf import FPDF
from fpdf.enums import XPos, YPos

app = Flask(__name__)
CORS(app)

class FinalProtestPDF(FPDF):

    def setup_layout_parameters(self):
        # Set a slightly smaller bottom margin to maximize space
        self.set_auto_page_break(auto=True, margin=8)
        self.set_left_margin(10)
        self.set_right_margin(10)

    def draw_page1_header(self, data):
        self.set_font('helvetica', 'B', 16)
        self.cell(0, 7, "Property Owner's Notice of Protest")
        self.ln(10)
        
        current_y = self.get_y()
        self.set_xy(175, 10)
        self.set_font('helvetica', 'B', 12)
        self.cell(30, 7, "Form 50-132", align='C', border=1)
        self.set_xy(10, current_y)

        self.set_font('helvetica', '', 9)
        self.cell(65, 5, "Appraisal District's Name", border="LTR")
        self.cell(65, 5, "Tax Year", border="LTR")
        self.cell(0, 5, "Appraisal District Account Number (if known)", border="LTR", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        self.set_font('helvetica', 'B', 10)
        self.cell(65, 8, f" {data.get('appraisalDistrictName', '')}", border="LBR")
        self.cell(65, 8, f" {data.get('taxYear', '')}", border="LBR")
        self.cell(0, 8, f" {data.get('accountNumber', '')}", border="LBR", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def draw_page2_header(self):
        self.set_y(10)
        self.set_font('helvetica', 'B', 12)
        self.cell(0, 7, "Form 50-132", align='R')
        self.set_y(15)

    def draw_section_header(self, title):
        self.ln(3) # Reduced spacing
        self.set_font('helvetica', 'B', 9)
        self.set_fill_color(0, 74, 158)
        self.set_text_color(255, 255, 255)
        self.cell(0, 7, f" {title}", fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_text_color(0, 0, 0)

    def draw_input_box(self, label, value, height=7):
        self.ln(1)
        self.set_font('helvetica', '', 8)
        self.cell(0, 4, label, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_font('helvetica', 'B', 10)
        self.multi_cell(0, height, f" {value}", border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def draw_checkbox(self, x, y, text, checked, text_width=85):
        self.set_xy(x, y)
        self.set_font('zapfdingbats', '', 12)
        self.cell(5, 5, '4' if checked else '', border=1)
        
        self.set_font('helvetica', '', 9)
        self.set_xy(x + 6, y)
        self.multi_cell(text_width, 4, text)
        return self.get_y()

    def add_first_page(self, data):
        self.add_page()
        self.draw_page1_header(data)

        self.draw_section_header("SECTION 1: Property Owner or Lessee")
        self.ln(2)
        y_cursor = self.get_y()
        self.draw_checkbox(12, y_cursor, "Person Age 65 or Older", data.get('isAge65OrOlder'), 45)
        self.draw_checkbox(72, y_cursor, "Disabled Person", data.get('isDisabledPerson'), 45)
        self.draw_checkbox(132, y_cursor, "Military Service Member", data.get('isMilitary'), 60)
        self.ln(6)
        y_cursor = self.get_y()
        self.draw_checkbox(12, y_cursor, "Military Veteran", data.get('isMilitaryVeteran'), 45)
        self.draw_checkbox(72, y_cursor, "Spouse of a Military Service Member or Veteran", data.get('isSpouseOfMilitary'), 120)
        
        self.draw_input_box("Name of Property Owner or Lessee", data.get('ownerName', ''))
        self.draw_input_box("Mailing Address, City, State, ZIP Code", data.get('ownerMailingAddress', ''))
        self.draw_input_box("Phone Number (area code and number)", data.get('ownerPhone', ''))

        self.draw_section_header("SECTION 2: Property Description")
        self.draw_input_box("Physical Address, City, State, Zip Code (if different than above)", data.get('propertyAddress', ''))
        self.draw_input_box("If no street address, provide legal description:", data.get('legalDescription', ''))
        self.draw_input_box("Mobile Home Make, Model and Identification (if applicable):", data.get('mobileHomeInfo', ''))

        self.draw_section_header("SECTION 3: Reasons for Protest")
        self.ln(2)
        self.set_font('helvetica', 'I', 9)
        self.multi_cell(0, 4, "To preserve your right to present each reason for your ARB protest according to law, be sure to select all boxes that apply...")
        self.ln(2)
        initial_y = self.get_y()
        y_L, y_R = initial_y, initial_y
        y_L = self.draw_checkbox(12, y_L, "Incorrect appraised (market) value and/or value is unequal compared with other properties.", data.get('protestIncorrectValue'))
        y_L = self.draw_checkbox(12, y_L + 2, f"Property should not be taxed in {data.get('protestTaxingUnit','_________')} (taxing unit).", data.get('protestTaxedInWrongUnit'))
        y_L = self.draw_checkbox(12, y_L + 2, "Property is not located in this appraisal district...", data.get('protestNotLocatedInDistrict'))
        y_L = self.draw_checkbox(12, y_L + 4, f"Failure to send required notice. ({data.get('protestNoticeType','_________')})", data.get('protestFailureToSendNotice'))
        y_L = self.draw_checkbox(12, y_L + 2, "Exemption was denied, modified or cancelled.", data.get('protestExemptionDenied'))
        y_L = self.draw_checkbox(12, y_L + 2, "Temporary disaster damage exemption was denied or modified.", data.get('protestTempDisasterDenied'))
        y_L = self.draw_checkbox(12, y_L + 4, "Ag-use, open-space or other special appraisal was denied...", data.get('protestAgUseDenied'))
        y_L = self.draw_checkbox(12, y_L + 4, "Change in use of land appraised as ag-use...", data.get('protestChangeInUse'))
        
        y_R = self.draw_checkbox(108, y_R, "Incorrect appraised or market value of land under special appraisal...", data.get('protestIncorrectSpecialValue'))
        y_R = self.draw_checkbox(108, y_R + 4, "Owner's name is incorrect.", data.get('protestOwnersNameIncorrect'))
        y_R = self.draw_checkbox(108, y_R + 2, "Property description is incorrect.", data.get('protestPropertyDescIncorrect'))
        y_R = self.draw_checkbox(108, y_R + 2, "Incorrect damage assessment rating for a property...", data.get('protestIncorrectDisasterRating'))
        y_R = self.draw_checkbox(108, y_R + 4, "Circuit breaker limitation on appraised value for all other real property...", data.get('protestCircuitBreakerDenied'))
        y_R = self.draw_checkbox(108, y_R + 4, f"Other: {data.get('protestOtherText','')}", data.get('protestOther'))
        
        self.set_y(max(y_L, y_R))

        self.draw_section_header("SECTION 4: Additional Facts")
        self.ln(2)
        self.set_font('helvetica', '', 10)
        label_text = "What is your opinion of your property's value? (optional) $"
        label_width = self.get_string_width(label_text) + 2
        self.cell(label_width, 5, label_text)
        self.set_font('helvetica', 'B', 10)
        self.cell(0, 5, f" {data.get('ownerOpinionValue', '')}", "B")
        self.ln(8)
        self.set_font('helvetica', '', 10)
        self.cell(0, 5, "Provide facts that may help resolve this protest:", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y_before_box = self.get_y()
        box_height = self.h - self.b_margin - y_before_box
        self.set_font('helvetica', 'B', 10)
        self.multi_cell(0, box_height, f" {data.get('additionalFacts', '')}", border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def add_second_page(self, data):
        self.add_page()
        self.draw_page2_header()
        
        # *** THE FIX FOR COMPACTING PAGE 2 IS HERE ***
        self.draw_section_header("SECTION 5: Hearing Type")
        self.set_font('helvetica', '', 9)
        self.cell(140, 5, "Do you request an informal conference with the appraisal office before the protest hearing?")
        self.draw_checkbox(150, self.get_y(), "Yes", data.get('hearingInformalConference') == 'yes', 20)
        self.draw_checkbox(170, self.get_y(), "No", data.get('hearingInformalConference') == 'no', 20)
        self.ln(5) # Reduced spacing
        self.multi_cell(115, 4, "Do you request a single-member ARB panel or a regular panel of at least three members?")
        self.set_y(self.get_y() - 8)
        self.draw_checkbox(130, self.get_y(), "Single-member panel", data.get('hearingPanel') == 'single', 40)
        self.draw_checkbox(170, self.get_y(), "Regular panel", data.get('hearingPanel') == 'regular', 40)
        self.ln(5) # Reduced spacing
        self.set_font('helvetica', 'I', 9)
        self.multi_cell(0, 4, "A property owner does not waive the right to appear in person at a protest hearing by submitting an affidavit to the ARB or by electing to appear by telephone conference call.")
        self.ln(1)
        self.set_font('helvetica', '', 9)
        self.cell(0, 5, "I intend to appear in the ARB hearing scheduled for my protest in the following manner (check only one box):", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        y_L = self.get_y()
        y_L = self.draw_checkbox(12, y_L, "In person", data.get('hearingAppearance') == 'inPerson')
        y_L = self.draw_checkbox(12, y_L + 2, "By telephone conference call and will submit evidence with a written affidavit...", data.get('hearingAppearance') == 'telephone')
        y_L = self.draw_checkbox(12, y_L + 6, "By videoconference and will submit evidence with a written affidavit...", data.get('hearingAppearance') == 'video')
        y_L = self.draw_checkbox(12, y_L + 6, "On written affidavit submitted with evidence...", data.get('hearingAppearance') == 'affidavit')
        self.set_y(y_L)

        self.draw_section_header("SECTION 6: ARB Hearing Notice and Procedures")
        self.cell(0, 5, "I request my notice of hearing to be delivered by (check one box only):", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.draw_checkbox(12, self.get_y(), "Regular first-class mail", data.get('noticeDelivery') == 'regularMail')
        self.draw_checkbox(12, self.get_y() + 6, "Certified mail and agree to pay the cost (if applicable)", data.get('noticeDelivery') == 'certifiedMail')
        self.ln(12) # Reduced spacing
        self.cell(140, 5, "I want the ARB to send me a copy of its hearing procedures.")
        self.draw_checkbox(150, self.get_y(), "Yes", data.get('wantsHearingProcedures') == 'yes', 20)
        self.draw_checkbox(170, self.get_y(), "No", data.get('wantsHearingProcedures') == 'no', 20)
        self.ln(5) # Reduced spacing
        self.cell(0, 5, "Do you request an electronic reminder by text or email of the date, time and place of your ARB protest hearing? (check one box only):", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        y_L = self.get_y()
        y_L = self.draw_checkbox(12, y_L, "No", data.get('requestElectronicReminder') == 'no')
        y_L = self.draw_checkbox(12, y_L + 2, f"Yes, by text to: {data.get('reminderPhone','')}", data.get('requestElectronicReminder') == 'byText')
        y_L = self.draw_checkbox(12, y_L + 4, f"Yes, by email to: {data.get('reminderEmail','')}", data.get('requestElectronicReminder') == 'byEmail')
        self.set_y(y_L)

        self.draw_section_header("SECTION 8: Certification and Signature")
        self.ln(2)
        y_cursor = self.get_y()
        self.draw_checkbox(12, y_cursor, "Property Owner", data.get('certification') == 'owner', 45)
        self.draw_checkbox(75, y_cursor, "Property Owner's Agent", data.get('certification') == 'agent', 50)
        self.draw_checkbox(140, y_cursor, "Other", data.get('certification') == 'other', 25)
        self.ln(8) # Reduced spacing
        
        # Reduced height for signature boxes
        self.draw_input_box("Print Name of Property Owner or Authorized Representative", data.get('ownerName', ''), height=10)
        self.draw_input_box("Signature of Property Owner or Authorized Representative", "", height=10)
        
        self.set_y(-15) # Final footer position
        self.set_font('helvetica', '', 8)
        self.cell(0, 5, "Page 2", align='R')

@app.route('/api/generate-protest', methods=['POST'])
def generate_protest_document():
    try:
        data = request.get_json()
        pdf = FinalProtestPDF('P', 'mm', 'Letter')
        pdf.setup_layout_parameters()
        
        pdf.add_first_page(data)
        pdf.add_second_page(data)
        
        output_filename = "temp_protest_form.pdf"
        pdf.output(output_filename)
        return send_file(output_filename, as_attachment=True, download_name="Official_Protest_Form_50-132.pdf", mimetype='application/pdf')
    except Exception as e:
        app.logger.error(f"An error occurred: {e}")
        return jsonify({"error": "An internal error occurred while generating the PDF."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)