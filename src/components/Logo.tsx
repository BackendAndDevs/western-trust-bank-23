import logoImage from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "md", showText = true, className = "" }: LogoProps) => {
  const sizes = {
    sm: { img: "h-8 w-8", text: "text-lg" },
    md: { img: "h-10 w-10", text: "text-xl" },
    lg: { img: "h-12 w-12", text: "text-2xl" },
    xl: { img: "h-16 w-16", text: "text-3xl" },
  };

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      <img 
        src={logoImage} 
        alt="Western Trust Bank Logo" 
        className={`${sizes[size].img} object-contain`}
        loading="eager"
      />
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold text-foreground leading-tight`}>
            Western Trust
          </span>
          <span className="text-xs text-muted-foreground tracking-wider uppercase">Bank</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
