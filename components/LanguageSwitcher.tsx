"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const languages = [
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", name: "English", flag: "🇺🇸" },
];

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null);
  const [mounted, setMounted] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    setMounted(true);
  }, []);

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
    setIsOpen(false);
  };

  const getButtonPosition = () => {
    if (!buttonRef) return { top: 80, right: 24 };
    const rect = buttonRef.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    };
  };

  const dropdownContent =
    isOpen && mounted ? (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/20"
          style={{ zIndex: 999999 }}
          onClick={(e) => {
            e.preventDefault();
            console.log("Backdrop clicked");
            setIsOpen(false);
          }}
        />

        {/* Menu */}
        <div
          className="fixed min-w-[200px] bg-gray-900 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl overflow-hidden"
          style={{
            zIndex: 1000000,
            top: `${getButtonPosition().top}px`,
            right: `${getButtonPosition().right}px`,
          }}
        >
          {languages.map((language) => (
            <button
              key={language.code}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Language option clicked:", language.code);
                switchLocale(language.code);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 cursor-pointer ${
                locale === language.code
                  ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-100 border-l-4 border-yellow-400"
                  : "text-white hover:bg-white/10 hover:text-yellow-100"
              }`}
            >
              <span className="text-lg pointer-events-none">
                {language.flag}
              </span>
              <div className="flex flex-col pointer-events-none">
                <span className="font-medium text-sm">{language.name}</span>
                {locale === language.code && (
                  <span className="text-xs text-yellow-300/80">
                    • {locale === "vi" ? "Đang sử dụng" : "Current"}
                  </span>
                )}
              </div>
              {locale === language.code && (
                <div className="ml-auto pointer-events-none">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                </div>
              )}
            </button>
          ))}
        </div>
      </>
    ) : null;

  return (
    <>
      <div className="relative">
        {/* Trigger Button */}
        <button
          ref={setButtonRef}
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Language switcher clicked, current state:", isOpen);
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 px-3 py-2 text-white hover:bg-white/20 transition-all duration-200 cursor-pointer select-none"
          aria-label={t("language")}
        >
          <Globe className="w-4 h-4 text-white/80 pointer-events-none" />
          <span className="text-sm font-medium pointer-events-none">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-white/60 transition-transform duration-200 pointer-events-none ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* Portal the dropdown to document.body */}
      {typeof window !== "undefined" &&
        dropdownContent &&
        createPortal(dropdownContent, document.body)}
    </>
  );
}
