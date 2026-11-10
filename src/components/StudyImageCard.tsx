import { useState } from "react";
import { ExternalLink, ImageOff } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";
import type { StudyImage } from "../data/studyImages";
import { googleSearchUrl } from "../utils/search";
export function StudyImageCard({ image }: { image: StudyImage }) {
  const { t, language } = useLanguage();
  const [failed, setFailed] = useState(false);
  return (
    <figure className="study-image-card" data-image-id={image.id}>
      <a
        className="study-image-preview"
        href={image.src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("View full image: {title} (opens in a new tab)", {
          title: t(image.title),
        })}
      >
        {failed ? (
          <span className="study-image-fallback">
            <ImageOff size={28} />
            {t("Image unavailable")}
          </span>
        ) : (
          <img
            src={image.src}
            alt={t(image.description)}
            loading="lazy"
            width="960"
            height="640"
            onError={() => setFailed(true)}
          />
        )}
        <span className="image-expand">
          <ExternalLink size={14} />
        </span>
      </a>
      <figcaption>
        <h3>{t(image.title)}</h3>
        <p>{t(image.description)}</p>
        <a
          className="image-google-link"
          href={googleSearchUrl(
            t(image.title) + " " + t(image.description),
            language,
            "images",
          )!}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("More on Google Images")}
          <ExternalLink size={12} />
        </a>
        <details className="image-credit">
          <summary>{t("Image credit & license")}</summary>
          <p>{image.artist}</p>
          <a href={image.sourceUrl} target="_blank" rel="noopener noreferrer">
            {t("Original source")}
          </a>
          <span> · </span>
          <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer">
            {t(image.license)}
          </a>
        </details>
      </figcaption>
    </figure>
  );
}
