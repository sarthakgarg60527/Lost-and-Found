import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    navBack: "Back to Feed",
    lost: "Lost",
    found: "Found",
    returned: "Returned",
    descTitle: "Description",
    genKey: "Generate Handover Key",
    regenKey: "Regenerate Key",
    verifyBtn: "Verify Receipt",
    delPost: "Delete This Post",
    matchTitle: "Possible Matches",
    otpTitle: "Security Handover Key",
    otpSubtitle: "Share this key with the person to verify",
    modalTitle: "Enter Handover Key",
    modalSub: "Ask the owner for 6-digit code",
    confirmBtn: "Confirm & Verify",
    successMsg: "Handover Successful! 🤝",
    noMatches: "No matches found yet..."
  },
  hi: {
    navBack: "पीछे जाएं",
    lost: "खोया हुआ",
    found: "मिला हुआ",
    returned: "वापस मिला",
    descTitle: "विवरण",
    genKey: "हैंडओवर कोड बनाएं",
    regenKey: "नया कोड बनाएं",
    verifyBtn: "रसीद वेरिफाई करें",
    delPost: "पोस्ट डिलीट करें",
    matchTitle: "संभावित मिलान",
    otpTitle: "सुरक्षा हैंडओवर कोड",
    otpSubtitle: "सत्यापित करने के लिए यह कोड सामने वाले को बताएं",
    modalTitle: "हैंडओवर कोड डालें",
    modalSub: "मालिक से 6-अंकों का कोड पूछें",
    confirmBtn: "पुष्टि करें",
    successMsg: "सफलतापूर्वक वापस मिल गया! 🤝",
    noMatches: "अभी तक कोई मिलान नहीं मिला..."
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en'); // Default English
  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);