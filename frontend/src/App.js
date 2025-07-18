import React, { useState } from 'react';
import './App.css';

function App() {
  const currentYear = new Date().getFullYear();
  
  const [formData, setFormData] = useState({
    // Page 1 data
    taxYear: currentYear.toString(),
    appraisalDistrictName: '',
    accountNumber: '',
    isAge65OrOlder: false, isDisabledPerson: false, isMilitary: false, isMilitaryVeteran: false, isSpouseOfMilitary: false,
    ownerName: '', ownerMailingAddress: '', ownerPhone: '',
    propertyAddress: '', legalDescription: '', mobileHomeInfo: '',
    protestIncorrectValue: true, protestUnequalValue: true, protestTaxedInWrongUnit: false, protestTaxingUnit: '',
    protestNotLocatedInDistrict: false, protestFailureToSendNotice: false, protestNoticeType: '', protestExemptionDenied: false,
    protestTempDisasterDenied: false, protestAgUseDenied: false, protestChangeInUse: false, protestIncorrectSpecialValue: false,
    protestOwnersNameIncorrect: false, protestPropertyDescIncorrect: false, protestIncorrectDisasterRating: false,
    protestCircuitBreakerDenied: false, protestOther: false, protestOtherText: '',
    ownerOpinionValue: '', additionalFacts: '',
    // Page 2 data
    hearingInformalConference: 'no', // 'yes' or 'no'
    hearingPanel: 'regular', // 'regular' or 'single'
    hearingAppearance: 'inPerson', // 'inPerson', 'telephone', 'video', 'affidavit'
    noticeDelivery: 'regularMail', // 'regularMail' or 'certifiedMail'
    wantsHearingProcedures: 'no', // 'yes' or 'no'
    requestElectronicReminder: 'no', // 'no', 'byText', 'byEmail'
    reminderPhone: '',
    reminderEmail: '',
    certification: 'owner', // 'owner', 'agent', 'other'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://redzill-backend.onrender.com/api/generate-protest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Protest_Form_${formData.accountNumber || 'Property'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to generate PDF. Is the backend server running?");
    }
  };

  return (
    <div className="App">
      <div className="form-container">
        <h1>Redzill - Texas Property Protest Generator</h1>
        <p>Please fill all the necessary details for Form 50-132.</p>
        
        <form onSubmit={handleSubmit}>
          {/* Top Section */}
          <div className="form-row">
            <div className="form-group">
              <label>Appraisal District's Name</label>
              <input type="text" name="appraisalDistrictName" value={formData.appraisalDistrictName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Tax Year</label>
              <input type="text" name="taxYear" value={formData.taxYear} onChange={handleChange} required />
            </div>
          </div>
          <label>Appraisal District Account Number (if known)</label>
          <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} />
          
          {/* Section 1 */}
          <h3>SECTION 1: Property Owner or Lessee</h3>
          <div className="checkbox-grid">
            <label className="checkbox-item"><input type="checkbox" name="isAge65OrOlder" checked={formData.isAge65OrOlder} onChange={handleChange} /> Person Age 65 or Older</label>
            <label className="checkbox-item"><input type="checkbox" name="isDisabledPerson" checked={formData.isDisabledPerson} onChange={handleChange} /> Disabled Person</label>
            <label className="checkbox-item"><input type="checkbox" name="isMilitary" checked={formData.isMilitary} onChange={handleChange} /> Military Service Member</label>
            <label className="checkbox-item"><input type="checkbox" name="isMilitaryVeteran" checked={formData.isMilitaryVeteran} onChange={handleChange} /> Military Veteran</label>
            <label className="checkbox-item"><input type="checkbox" name="isSpouseOfMilitary" checked={formData.isSpouseOfMilitary} onChange={handleChange} /> Spouse of a Military Service Member or Veteran</label>
          </div>
          <label>Name of Property Owner or Lessee</label>
          <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
          <label>Mailing Address, City, State, ZIP Code</label>
          <input type="text" name="ownerMailingAddress" value={formData.ownerMailingAddress} onChange={handleChange} required />
          <label>Phone Number</label>
          <input type="text" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} />
          
          {/* Section 2 */}
          <h3>SECTION 2: Property Description</h3>
          <label>Physical Address, City, State, Zip Code</label>
          <input type="text" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} required />
          <label>If no street address, provide legal description:</label>
          <input type="text" name="legalDescription" value={formData.legalDescription} onChange={handleChange} />
          <label>Mobile Home Make, Model and Identification (if applicable):</label>
          <input type="text" name="mobileHomeInfo" value={formData.mobileHomeInfo} onChange={handleChange} />

          {/* Section 3 */}
          <h3>SECTION 3: Reasons for Protest</h3>
          <p className="small-text">To preserve your right, select ALL boxes that apply.</p>
          <div className="checkbox-grid-reasons">
            <label className="checkbox-item-reason"><input type="checkbox" name="protestIncorrectValue" checked={formData.protestIncorrectValue} onChange={handleChange} /> Incorrect appraised (market) value and/or value is unequal compared with other properties.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestIncorrectSpecialValue" checked={formData.protestIncorrectSpecialValue} onChange={handleChange} /> Incorrect appraised or market value of land under special appraisal.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestOwnersNameIncorrect" checked={formData.protestOwnersNameIncorrect} onChange={handleChange} /> Owner's name is incorrect.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestPropertyDescIncorrect" checked={formData.protestPropertyDescIncorrect} onChange={handleChange} /> Property description is incorrect.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestIncorrectDisasterRating" checked={formData.protestIncorrectDisasterRating} onChange={handleChange} /> Incorrect damage assessment rating for a property qualified for a temporary disaster exemption.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestCircuitBreakerDenied" checked={formData.protestCircuitBreakerDenied} onChange={handleChange} /> Circuit breaker limitation on appraised value was denied, modified or canceled.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestExemptionDenied" checked={formData.protestExemptionDenied} onChange={handleChange} /> Exemption was denied, modified or cancelled.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestTempDisasterDenied" checked={formData.protestTempDisasterDenied} onChange={handleChange} /> Temporary disaster damage exemption was denied or modified.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestAgUseDenied" checked={formData.protestAgUseDenied} onChange={handleChange} /> Ag-use, open-space or other special appraisal was denied.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestChangeInUse" checked={formData.protestChangeInUse} onChange={handleChange} /> Change in use of land appraised as ag-use, open-space or timberland.</label>
            <label className="checkbox-item-reason"><input type="checkbox" name="protestNotLocatedInDistrict" checked={formData.protestNotLocatedInDistrict} onChange={handleChange} /> Property is not located in this appraisal district.</label>
            <div className="checkbox-item-with-text">
                <label><input type="checkbox" name="protestTaxedInWrongUnit" checked={formData.protestTaxedInWrongUnit} onChange={handleChange} /> Property should not be taxed in </label><input type="text" name="protestTaxingUnit" value={formData.protestTaxingUnit} onChange={handleChange} className="inline-text" placeholder="(taxing unit)"/>
            </div>
            <div className="checkbox-item-with-text">
                <label><input type="checkbox" name="protestFailureToSendNotice" checked={formData.protestFailureToSendNotice} onChange={handleChange} /> Failure to send required notice. </label><input type="text" name="protestNoticeType" value={formData.protestNoticeType} onChange={handleChange} className="inline-text" placeholder="(type)"/>
            </div>
            <div className="checkbox-item-with-text">
                <label><input type="checkbox" name="protestOther" checked={formData.protestOther} onChange={handleChange} /> Other: </label><input type="text" name="protestOtherText" value={formData.protestOtherText} onChange={handleChange} className="inline-text" placeholder="Describe other reason"/>
            </div>
          </div>
          
          {/* Section 4 */}
          <h3>SECTION 4: Additional Facts</h3>
          <label>What is your opinion of your property's value? (optional)</label>
          <input type="number" name="ownerOpinionValue" value={formData.ownerOpinionValue} onChange={handleChange} />
          <label>Provide facts that may help resolve this protest:</label>
          <textarea name="additionalFacts" value={formData.additionalFacts} onChange={handleChange} rows="4"></textarea>

          {/* Section 5 */}
          <h3>SECTION 5: Hearing Type</h3>
          <label>Do you request an informal conference with the appraisal office before the protest hearing?</label>
          <div className="radio-group">
            <label><input type="radio" name="hearingInformalConference" value="yes" checked={formData.hearingInformalConference === 'yes'} onChange={handleChange}/> Yes</label>
            <label><input type="radio" name="hearingInformalConference" value="no" checked={formData.hearingInformalConference === 'no'} onChange={handleChange}/> No</label>
          </div>
          <label>Do you request a single-member ARB panel or a regular panel of at least three members?</label>
          <div className="radio-group">
            <label><input type="radio" name="hearingPanel" value="single" checked={formData.hearingPanel === 'single'} onChange={handleChange}/> Single-member panel</label>
            <label><input type="radio" name="hearingPanel" value="regular" checked={formData.hearingPanel === 'regular'} onChange={handleChange}/> Regular panel</label>
          </div>
          <label>I intend to appear in the ARB hearing scheduled for my protest in the following manner (check only one box):</label>
          <div className="radio-group-vertical">
            <label><input type="radio" name="hearingAppearance" value="inPerson" checked={formData.hearingAppearance === 'inPerson'} onChange={handleChange}/> In person</label>
            <label><input type="radio" name="hearingAppearance" value="telephone" checked={formData.hearingAppearance === 'telephone'} onChange={handleChange}/> By telephone conference call</label>
            <label><input type="radio" name="hearingAppearance" value="video" checked={formData.hearingAppearance === 'video'} onChange={handleChange}/> By videoconference</label>
            <label><input type="radio" name="hearingAppearance" value="affidavit" checked={formData.hearingAppearance === 'affidavit'} onChange={handleChange}/> On written affidavit submitted with evidence</label>
          </div>

          {/* Section 6 */}
          <h3>SECTION 6: ARB Hearing Notice and Procedures</h3>
          <label>I request my notice of hearing to be delivered by (check one box only):</label>
          <div className="radio-group-vertical">
              <label><input type="radio" name="noticeDelivery" value="regularMail" checked={formData.noticeDelivery === 'regularMail'} onChange={handleChange}/> Regular first-class mail</label>
              <label><input type="radio" name="noticeDelivery" value="certifiedMail" checked={formData.noticeDelivery === 'certifiedMail'} onChange={handleChange}/> Certified mail and agree to pay the cost</label>
          </div>
          <label>I want the ARB to send me a copy of its hearing procedures.</label>
          <div className="radio-group">
              <label><input type="radio" name="wantsHearingProcedures" value="yes" checked={formData.wantsHearingProcedures === 'yes'} onChange={handleChange}/> Yes</label>
              <label><input type="radio" name="wantsHearingProcedures" value="no" checked={formData.wantsHearingProcedures === 'no'} onChange={handleChange}/> No</label>
          </div>
          <label>Do you request an electronic reminder by text or email?</label>
          <div className="radio-group-vertical">
              <label><input type="radio" name="requestElectronicReminder" value="no" checked={formData.requestElectronicReminder === 'no'} onChange={handleChange}/> No</label>
              <label><input type="radio" name="requestElectronicReminder" value="byText" checked={formData.requestElectronicReminder === 'byText'} onChange={handleChange}/> Yes, by text to:</label>
              {formData.requestElectronicReminder === 'byText' && <input type="text" name="reminderPhone" placeholder="Mobile phone number" value={formData.reminderPhone} onChange={handleChange} className="inline-text-expanded"/>}
              <label><input type="radio" name="requestElectronicReminder" value="byEmail" checked={formData.requestElectronicReminder === 'byEmail'} onChange={handleChange}/> Yes, by email to:</label>
              {formData.requestElectronicReminder === 'byEmail' && <input type="text" name="reminderEmail" placeholder="Email address" value={formData.reminderEmail} onChange={handleChange} className="inline-text-expanded"/>}
          </div>
          
          {/* Section 8 */}
          <h3>SECTION 8: Certification and Signature</h3>
          <p className="small-text">Note: Section 7 regarding properties valued over $61 million is omitted for this general-purpose form.</p>
          <div className="radio-group">
            <label><input type="radio" name="certification" value="owner" checked={formData.certification === 'owner'} onChange={handleChange}/> Property Owner</label>
            <label><input type="radio" name="certification" value="agent" checked={formData.certification === 'agent'} onChange={handleChange}/> Property Owner's Agent</label>
            <label><input type="radio" name="certification" value="other" checked={formData.certification === 'other'} onChange={handleChange}/> Other</label>
          </div>


          <button type="submit">Generate Final Two-Page PDF</button>
        </form>
      </div>
    </div>
  );
}

export default App;