import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./locales/fr";
import ar from "./locales/ar";

const savedLang = typeof window !== "undefined" ? localStorage.getItem("movia-lang") || "fr" : "fr";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
    },
    lng: savedLang,
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

if (typeof document !== "undefined") {
  document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = savedLang;
}

export default i18n;
