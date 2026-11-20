import { Image as ImageIcon } from "lucide-react";
import PharmacyProductCarousel from "@/components/storefront/PharmacyProductCarousel";
import UniversalVideoEmbed from "@/components/storefront/UniversalVideoEmbed";
import ContactFormClient from "@/components/storefront/ContactFormClient";

interface Props {
  blockType: string;
  data: any;
}

export default function PreviewSectionRenderer({ blockType, data }: Props) {
  if (!data) return null;

  switch (blockType) {
    case "image":
      return (
        <section className={`w-full ${data.fullWidth ? "" : "max-w-360 mx-auto px-6"} py-12`}>
          <div className={`overflow-hidden ${data.fullWidth ? "" : "rounded-[2.5rem] border border-border shadow-2xl"}`}>
            {data.aspectRatio && data.aspectRatio !== "auto" ? (
              <div style={{ aspectRatio: data.aspectRatio, width: "100%" }}>
                <img
                  src={data.url}
                  alt={data.altText || "Image"}
                  className="w-full h-full"
                  style={{ objectFit: data.objectFit || "cover", display: "block" }}
                />
              </div>
            ) : (
              <img
                src={data.url}
                alt={data.altText || "Image"}
                className="w-full h-auto"
                style={{ objectFit: data.objectFit || "cover", display: "block" }}
              />
            )}
          </div>
        </section>
      );

    case "image-text":
      return (
        <section className="max-w-360 mx-auto px-6 py-12">
          <div className={`flex flex-col ${data.imagePosition === "right" ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
            <div className="w-full lg:w-1/2">
              <div className="aspect-4/5 rounded-[2.5rem] overflow-hidden border border-border bg-muted shadow-2xl relative">
                {data.image ? (
                  <img src={data.image} alt={data.heading || "Image"} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="absolute inset-0 m-auto text-muted-foreground/30 w-16 h-16" />
                )}
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
                {data.heading}
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full" />
              <div className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {data.content}
              </div>
            </div>
          </div>
        </section>
      );

    case "video":
      return (
        <section className={`w-full ${data.fullWidth ? "px-0" : "max-w-6xl mx-auto px-4 sm:px-6"} py-8 sm:py-12`}>
          {data.heading && (
            <h2 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight text-center text-foreground mb-6 sm:mb-8 font-serif ${data.fullWidth ? "px-4 sm:px-6" : ""}`}>
              {data.heading}
            </h2>
          )}
          <UniversalVideoEmbed
            url={data.videoUrl}
            title={data.heading || "Video"}
            posterImage={data.posterImage}
            aspectRatio={data.aspectRatio || "auto"}
            objectFit={data.objectFit || "contain"}
            maxHeight={data.maxHeight || "75vh"}
            autoPlay={data.autoPlay || false}
            showPlayButton={data.showPlayButton !== false}
          />
        </section>
      );

    case "video-text":
      return (
        <section className="max-w-360 mx-auto px-6 py-12">
          <div className={`flex flex-col ${data.videoPosition === "right" ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-24`}>
            <div className="w-full lg:w-1/2">
              <div className="aspect-4/3 rounded-[2.5rem] overflow-hidden border border-border bg-black shadow-2xl relative">
                <UniversalVideoEmbed
                  url={data.videoUrl}
                  title={data.heading || "Video"}
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
                {data.heading}
              </h2>
              <div className="w-16 h-1 bg-primary rounded-full" />
              <div className="text-lg text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                {data.content}
              </div>
            </div>
          </div>
        </section>
      );

    case "custom-html":
      const wrapperTheme = data.themeWrapper || "none";
      const customHtmlContent = data.htmlContent || "";

      if (wrapperTheme === "aurora") {
        return (
          <section className="w-full relative overflow-hidden min-h-[50vh] flex flex-col justify-center py-20 bg-neutral-950">
            <div className="absolute inset-0 bg-neutral-950 -z-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/30 blur-[120px] animate-pulse -z-10 mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 blur-[150px] animate-pulse -z-10 mix-blend-screen" style={{ animationDelay: '2s' }} />
            <div className="user-generated-content relative z-10 max-w-360 mx-auto px-6 w-full text-white" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
          </section>
        );
      }

      if (wrapperTheme === "cyberpunk") {
        return (
          <section className="w-full relative overflow-hidden min-h-[50vh] flex flex-col justify-center bg-black font-mono border-y border-[#0f0] py-20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMjU1LCAwLCAwLjEpIi8+PC9zdmc+')] opacity-50" />
            <div className="user-generated-content relative z-10 max-w-360 mx-auto px-6 w-full text-white" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
          </section>
        );
      }

      if (wrapperTheme === "glassmorphism") {
        return (
          <section className="max-w-[100rem] mx-auto p-4 md:p-8">
            <div className="relative rounded-[3rem] min-h-[50vh] flex flex-col justify-center overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10" />
              <div className="user-generated-content relative z-10 max-w-360 w-full mx-auto backdrop-blur-xl bg-background/40 border border-border/50 p-10 md:p-16 rounded-4xl shadow-2xl" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
            </div>
          </section>
        );
      }

      if (wrapperTheme === "minimalist") {
        return (
          <section className="w-full relative min-h-[50vh] flex flex-col justify-center bg-background py-24 px-6 border-y border-border/30">
            <div className="user-generated-content relative z-10 max-w-360 mx-auto w-full text-foreground" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
          </section>
        );
      }

      if (wrapperTheme === "grid-matrix") {
        return (
          <section className="w-full relative min-h-[50vh] flex flex-col justify-center bg-black overflow-hidden py-32 border-y border-neutral-800">
            <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 opacity-20">
              {Array.from({ length: 72 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-neutral-700 hover:bg-primary transition-colors duration-500 cursor-crosshair" />
              ))}
            </div>
            <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black pointer-events-none" />
            <div className="user-generated-content relative z-10 max-w-360 mx-auto px-6 w-full text-white" dangerouslySetInnerHTML={{ __html: customHtmlContent }} />
          </section>
        );
      }

      // Fallback (none / transparent)
      return (
        <section className="max-w-360 mx-auto px-6 py-12 w-full">
          <div dangerouslySetInnerHTML={{ __html: customHtmlContent }} className="user-generated-content w-full [&>div]:w-full" />
        </section>
      );

    case "pharmacy-catalog":
      return (
        <PharmacyProductCarousel
          title={data.heading || "Catalog"}
          subtitle={data.subheading || data.subtitle}
          products={data.products || []}
          bannerImage={data.bgImage || data.image || data.bannerImage}
          viewAllLink={data.categorySlug ? `/collections/${data.categorySlug}` : "/collections/all"}
        />
      );

    case "contact-form":
    case "contact":
      return (
        <section className="py-8 sm:py-12 bg-background w-full">
          <ContactFormClient
            heading={data.heading}
            subheading={data.subheading}
            customEmail={data.email}
            customPhone={data.phone}
            customAddress={data.address}
            showDirectChannels={data.showDirectChannels !== false}
          />
        </section>
      );

    default:
      return null;
  }
}

