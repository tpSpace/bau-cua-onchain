"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, "") || "/";
    // Navigate to the new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <motion.div
      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-2"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Globe className="w-4 h-4 text-white/80" />
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="bg-transparent text-white text-sm border-none outline-none cursor-pointer"
        aria-label={t("language")}
      >
        <option value="vi" className="bg-gray-800 text-white">
          🇻🇳 Tiếng Việt
        </option>
        <option value="en" className="bg-gray-800 text-white">
          🇺🇸 English
        </option>
      </select>
    </motion.div>
  );
}
