import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, User, Mail, Phone, Lock, CheckCircle2, AlertCircle,
  Loader2, Sparkles, Building, MapPin, ArrowRight, ArrowLeft,
  ShieldCheck, FileCheck, Info
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ASSAM_DISTRICTS = [
  'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar',
  'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh',
  'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat',
  'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
  'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar',
  'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
];

const STEPS = [
  { id: 1, label: 'School Info' },
  { id: 2, label: 'UDISE & Location' },
  { id: 3, label: 'Leadership' },
  { id: 4, label: 'Account Setup' },
  { id: 5, label: 'Review & Submit' }
];

const RegisterSchool = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    school_name: '',
    school_type: 'Government Model School',
    board: 'SEBA',
    udise_school_id: '',
    address_line_1: '',
    address_line_2: '',
    block: '',
    district: 'Kamrup',
    state: 'Assam',
    pin_code: '',
    official_email: '',
    official_phone: '',
    website: '',
    principal_name: '',
    principal_email: '',
    principal_phone: '',
    coordinator_name: '',
    coordinator_email: '',
    coordinator_phone: '',
    coordinator_designation: 'Innovation Mentor / PGT Science',
    password: '',
    confirm_password: '',
    accept_terms: false
  });

  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { addToast } = useToast();
  const navigate = useNavigate();

  // Real-time UDISE format check: 11 digits starting with Assam code 18
  const isUdiseValid = /^18\d{9}$/.test(formData.udise_school_id.trim());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateCurrentStep = () => {
    setErrorMsg('');
    if (currentStep === 1) {
      if (!formData.school_name.trim()) {
        setErrorMsg('Please enter your official School Name.');
        return false;
      }
    } else if (currentStep === 2) {
      const udise = formData.udise_school_id.trim();
      if (!udise) {
        setErrorMsg('UDISE School ID is mandatory.');
        return false;
      }
      if (!isUdiseValid) {
        setErrorMsg('UDISE School ID must be an 11-digit code starting with Assam state prefix "18" (e.g. 18010100101).');
        return false;
      }
      if (!formData.district || !ASSAM_DISTRICTS.includes(formData.district)) {
        setErrorMsg('Please select a valid Assam district.');
        return false;
      }
      if (!formData.address_line_1.trim()) {
        setErrorMsg('Please enter your School Address.');
        return false;
      }
      if (!/^\d{6}$/.test(formData.pin_code.trim())) {
        setErrorMsg('Please enter a valid 6-digit Assam PIN code.');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.principal_name.trim() || !formData.principal_email.trim() || !formData.principal_phone.trim()) {
        setErrorMsg('Please provide all Principal details (Name, Email, Mobile).');
        return false;
      }
      if (!formData.coordinator_name.trim() || !formData.coordinator_email.trim() || !formData.coordinator_phone.trim()) {
        setErrorMsg('Please provide all Program Coordinator / Mentor details.');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.official_email.trim() || !formData.official_phone.trim()) {
        setErrorMsg('Official School Email and Contact Phone are required.');
        return false;
      }
      if (formData.password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return false;
      }
      if (formData.password !== formData.confirm_password) {
        setErrorMsg('Passwords do not match.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(STEPS.length, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.accept_terms) {
      setErrorMsg('You must certify institutional authenticity and accept official program guidelines.');
      return;
    }

    setLoading(true);
    try {
      // Backend validates state == 'Assam', UDISE format, duplicate UDISE & email
      const payload = {
        ...formData,
        state: 'Assam'
      };
      await api.post('/schools/register', payload);
      setSubmittedSuccess(true);
      addToast('School registration application submitted successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Submission failed. Please check inputs.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {submittedSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Application Submitted for Institutional Verification
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Thank you for registering <strong>{formData.school_name}</strong> for the Assam Future Innovation Program.
              </p>

              <div className="mt-6 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 max-w-lg mx-auto text-left leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>UDISE Status: Format Validated (Pending Admin Verification)</span>
                </div>
                <p>
                  UDISE ID: <strong className="font-mono text-emerald-900">{formData.udise_school_id}</strong>
                </p>
                <p className="text-slate-600">
                  Our state committee will verify your institutional record. Once verified and approved, your unique public School Code (e.g. <code>AFIP-AS-KAM-00001</code>) will be issued, activating full team registration privileges.
                </p>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Link
                  to="/login/school"
                  className="px-6 py-3 rounded-xl bg-emerald-800 text-white font-bold text-sm shadow-md hover:bg-emerald-900 transition-all"
                >
                  Proceed to School Login
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Back to Homepage
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="p-8 sm:p-10 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>State Innovation Portal</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    Assam Schools Only
                  </div>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                  Register Your Institution
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                  Join the state-wide student innovation challenge for Classes VI–XII. Approved Assam schools receive dedicated IIT mentors, prototyping grants, and team management tools.
                </p>

                {/* Progress Stepper */}
                <div className="mt-8 pt-6 border-t border-white/15">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    {STEPS.map((step) => {
                      const isPast = currentStep > step.id;
                      const isCurrent = currentStep === step.id;
                      return (
                        <div key={step.id} className="flex flex-col items-center relative flex-1">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isPast
                                ? 'bg-amber-400 text-slate-950 shadow-md'
                                : isCurrent
                                ? 'bg-white text-emerald-950 ring-4 ring-emerald-500/30'
                                : 'bg-white/20 text-emerald-200'
                            }`}
                          >
                            {isPast ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-semibold text-center hidden sm:block ${
                              isCurrent ? 'text-amber-300' : isPast ? 'text-white' : 'text-emerald-300/60'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {/* STEP 1: SCHOOL INFORMATION */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span>Step 1: Institutional Identification</span>
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Official School Name *
                          </label>
                          <input
                            type="text"
                            name="school_name"
                            required
                            placeholder="e.g. Brahmaputra Model Higher Secondary School"
                            value={formData.school_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              School Type *
                            </label>
                            <select
                              name="school_type"
                              value={formData.school_type}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            >
                              <option value="Government Model School">Government Model School</option>
                              <option value="Provincialized Higher Secondary">Provincialized Higher Secondary</option>
                              <option value="Adarsha Vidyalaya">Adarsha Vidyalaya</option>
                              <option value="Kasturba Gandhi Balika Vidyalaya">Kasturba Gandhi Balika Vidyalaya</option>
                              <option value="Tea Garden Model School">Tea Garden Model School</option>
                              <option value="Affiliated Private School">Affiliated Private School</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Affiliation Board *
                            </label>
                            <select
                              name="board"
                              value={formData.board}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            >
                              <option value="SEBA">SEBA (Secondary Education Board of Assam)</option>
                              <option value="AHSEC">AHSEC (Higher Secondary Education Council)</option>
                              <option value="CBSE">CBSE</option>
                              <option value="ICSE">ICSE</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: UDISE & LOCATION (ASSAM ENFORCED) */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Step 2: UDISE School Code &amp; Assam Location</span>
                      </h3>

                      {/* UDISE Input Box with live format badge */}
                      <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-amber-950">
                            UDISE School ID (Mandatory) *
                          </label>
                          {formData.udise_school_id && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isUdiseValid
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              {isUdiseValid ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                  <span>Format Valid (Assam Prefix 18)</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3 text-rose-700" />
                                  <span>Must be 11 digits starting with 18</span>
                                </>
                              )}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          name="udise_school_id"
                          maxLength={11}
                          required
                          placeholder="e.g. 18010100101"
                          value={formData.udise_school_id}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl font-mono text-sm bg-white border border-amber-300 focus:outline-emerald-600"
                        />
                        <div className="flex items-start gap-1.5 text-[11px] text-amber-900/80">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
                          <span>
                            Assam schools possess an 11-digit national UDISE code with state code prefix <strong>18</strong>. Our system distinguishes instant <em>Format Validation</em> from official <em>Admin Verification</em>.
                          </span>
                        </div>
                      </div>

                      {/* State (Fixed) & District (Controlled) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            State (Restricted)
                          </label>
                          <div className="w-full px-4 py-2.5 rounded-xl text-sm bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold flex items-center justify-between">
                            <span>Assam</span>
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold uppercase">
                              Eligibility Enforced
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Assam District *
                          </label>
                          <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          >
                            {ASSAM_DISTRICTS.map((d) => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            School Address Line 1 *
                          </label>
                          <input
                            type="text"
                            name="address_line_1"
                            required
                            placeholder="Street, Educational Zone or Landmark"
                            value={formData.address_line_1}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Educational Block / Sub-Division *
                          </label>
                          <input
                            type="text"
                            name="block"
                            required
                            placeholder="e.g. Rani Development Block / Guwahati East"
                            value={formData.block}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            name="address_line_2"
                            placeholder="Post Office / Police Station area"
                            value={formData.address_line_2}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            name="pin_code"
                            maxLength={6}
                            required
                            placeholder="781001"
                            value={formData.pin_code}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: LEADERSHIP & MENTOR DETAILS */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Principal */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Principal Information</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Name *</label>
                            <input
                              type="text"
                              name="principal_name"
                              required
                              placeholder="Dr. / Sri / Smt."
                              value={formData.principal_name}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Email *</label>
                            <input
                              type="email"
                              name="principal_email"
                              required
                              placeholder="principal@school.edu"
                              value={formData.principal_email}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Mobile *</label>
                            <input
                              type="tel"
                              name="principal_phone"
                              required
                              placeholder="+91 94350 XXXXX"
                              value={formData.principal_phone}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Coordinator / Innovation Mentor */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          <span>Teacher Coordinator / Innovation Mentor</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Coordinator Name *</label>
                            <input
                              type="text"
                              name="coordinator_name"
                              required
                              placeholder="Teacher Name"
                              value={formData.coordinator_name}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Coordinator Email *</label>
                            <input
                              type="email"
                              name="coordinator_email"
                              required
                              placeholder="mentor@school.edu"
                              value={formData.coordinator_email}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Coordinator Mobile *</label>
                            <input
                              type="tel"
                              name="coordinator_phone"
                              required
                              placeholder="+91 98640 XXXXX"
                              value={formData.coordinator_phone}
                              onChange={handleChange}
                              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: CONTACT & PORTAL PASSWORD */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Step 4: Official Credentials &amp; Portal Setup</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Official School Email (Login ID) *
                          </label>
                          <input
                            type="email"
                            name="official_email"
                            required
                            placeholder="school@assam.gov.in"
                            value={formData.official_email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Official Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="official_phone"
                            required
                            placeholder="+91 361 223456"
                            value={formData.official_phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Create Account Password *
                          </label>
                          <input
                            type="password"
                            name="password"
                            required
                            placeholder="Min. 8 alphanumeric characters"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            name="confirm_password"
                            required
                            placeholder="Re-enter password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:outline-emerald-600"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 5: REVIEW & SUBMIT */}
                  {currentStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                        <FileCheck className="w-4 h-4" />
                        <span>Step 5: Review Institutional Registration</span>
                      </h3>

                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-500 font-medium">School Name:</span>
                            <div className="font-bold text-slate-900">{formData.school_name}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">UDISE School ID:</span>
                            <div className="font-bold font-mono text-emerald-800">{formData.udise_school_id}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Location:</span>
                            <div className="font-semibold text-slate-900">{formData.district}, Assam (PIN: {formData.pin_code})</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Type &amp; Board:</span>
                            <div className="font-semibold text-slate-900">{formData.school_type} • {formData.board}</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Principal:</span>
                            <div className="font-semibold text-slate-900">{formData.principal_name} ({formData.principal_email})</div>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium">Innovation Coordinator:</span>
                            <div className="font-semibold text-slate-900">{formData.coordinator_name} ({formData.coordinator_email})</div>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-slate-500 font-medium">Official Contact:</span>
                            <div className="font-semibold text-slate-900">{formData.official_email} • {formData.official_phone}</div>
                          </div>
                        </div>
                      </div>

                      {/* UDISE Verification Status Banner */}
                      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          <ShieldCheck className="w-5 h-5 text-blue-700" />
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-blue-900 flex items-center gap-2">
                            UDISE ID Status:
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-800 font-bold">
                              <CheckCircle2 className="w-3 h-3 text-blue-600" />
                              Format Validated ✓
                            </span>
                          </div>
                          <p className="text-blue-700 leading-relaxed">
                            Your UDISE ID <strong className="font-mono">{formData.udise_school_id}</strong> passes the mandatory 11-digit Assam format check (prefix 18). An AFIP administrator will officially verify your UDISE against government records after submission.
                          </p>
                          <p className="text-blue-600 italic">
                            You will receive a portal notification once your UDISE is officially verified.
                          </p>
                        </div>
                      </div>

                      {/* Terms Acceptance */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                        <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700 leading-relaxed">
                          <input
                            type="checkbox"
                            name="accept_terms"
                            checked={formData.accept_terms}
                            onChange={handleChange}
                            className="mt-0.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600"
                          />
                          <span>
                            We certify that <strong>{formData.school_name}</strong> is a recognized educational institution in the state of Assam with valid UDISE <strong>{formData.udise_school_id}</strong>, and agree to abide by all guidelines and safety protocols of the Assam Future Innovation Program.
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form Stepper Actions */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < STEPS.length ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Next Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit School Registration</span>
                          <CheckCircle2 className="w-5 h-5 text-amber-300" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterSchool;
