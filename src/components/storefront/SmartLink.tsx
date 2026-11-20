import React from "react";
import Link from "next/link";

interface SmartLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export default function SmartLink({ href, children, className, target, rel, style, onClick, ...props }: SmartLinkProps) {
  if (!href) return <span className={className} style={style}>{children}</span>;

  let cleanHref = href.trim();
  const lower = cleanHref.toLowerCase();

  // If the link contains an email address (@) and does not start with http/https/mailto, automatically prefix mailto:
  if (cleanHref.includes("@") && !lower.startsWith("mailto:") && !lower.startsWith("http://") && !lower.startsWith("https://")) {
    cleanHref = `mailto:${cleanHref}`;
  }

  const updatedLower = cleanHref.toLowerCase();
  const isExternalOrProtocol =
    updatedLower.startsWith("mailto:") ||
    updatedLower.startsWith("tel:") ||
    updatedLower.startsWith("http://") ||
    updatedLower.startsWith("https://");

  if (isExternalOrProtocol) {
    return (
      <a
        href={cleanHref}
        className={className}
        style={style}
        target={target || (updatedLower.startsWith("http") ? "_blank" : undefined)}
        rel={rel || (updatedLower.startsWith("http") ? "noopener noreferrer" : undefined)}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={cleanHref} className={className} style={style} target={target} rel={rel} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
