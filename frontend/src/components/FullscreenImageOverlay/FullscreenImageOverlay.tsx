import { useState } from "react";
import Image from "next/image";

export type FullscreenImageOverlayProps = {
  src: string,
  width: number,
  height: number,
  alt: string,
}

const FullscreenImageOverlay: React.FC<FullscreenImageOverlayProps> = ({ src, width, height, alt }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClick = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 bg-black transition-opacity duration-300 ${
          isFullscreen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClick}
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <Image src={src} fill={true} style={{objectFit: "contain"}} alt={alt}/>
        </div>
      </div>
      <div onClick={handleClick}>
        <Image src={src} width={width} height={height} alt={alt} />
      </div>
    </>
  );
};

export default FullscreenImageOverlay;
