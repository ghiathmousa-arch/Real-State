import { Helmet as HelmetComponent } from "react-helmet-async"
const Helmet = HelmetComponent as any
import SEO_CONFIG from "../../../seo.config"

interface Props {
  title?: string
  description?: string
}

const SEO = ({ title, description }: Props) => {
  const fullTitle = title
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.titleAr

  const desc = description || SEO_CONFIG.descriptionAr

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={SEO_CONFIG.url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={SEO_CONFIG.image} />
      <meta property="og:url" content={SEO_CONFIG.url} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content="ar_SY" />

      <meta name="description" lang="en" content={SEO_CONFIG.descriptionEn} />
    </Helmet>
  )
}

export default SEO