import { ExternalLink, Image, Search } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import { googleSearchUrl } from "../utils/search";

export function GoogleSearchLinks({ query }: { query: string }) {
  const { language, t } = useLanguage();
  const web = googleSearchUrl(query, language);
  const images = googleSearchUrl(query, language, "images");
  if (!web || !images) return null;
  return (
    <div
      className="google-learning-links"
      aria-label={t("Explore this question")}
    >
      <a
        href={web}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Understand on Google (opens in a new tab)")}
      >
        <Search size={15} />
        <span>{t("Understand on Google")}</span>
        <ExternalLink size={12} />
      </a>
      <a
        href={images}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Related images (opens in a new tab)")}
      >
        <Image size={15} />
        <span>{t("Related images")}</span>
        <ExternalLink size={12} />
      </a>
    </div>
  );
}
