import {useEffect, useRef, useState} from "react";
import Image from "next/image";

export type FullscreenImageOverlayProps = {
  src: string,
  width: number,
  height: number,
  alt: string,
}

const FullscreenImageOverlay: React.FC<FullscreenImageOverlayProps> = ({ src, width, height, alt }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const clickTimeout = useRef<number | null>(null); // Declare a click timeout ref

  const handleClick = () => {
    if (clickTimeout.current) {
      // If there is a click timeout, then the user is double clicking
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
      setIsFullscreen(!isFullscreen);
    } else {
      // Otherwise, the user is single clicking
      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;
        setIsFullscreen(!isFullscreen);
      }, 300) as unknown as number; // Set the timeout to 300ms
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      setIsFullscreen(false);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 bottom-0 bg-black transition-opacity duration-300 ${
          isFullscreen ? "opacity-100 pointer-events-auto z-10 cursor-pointer" : "opacity-0 pointer-events-none z-0"
        }`}
        onClick={handleClick}
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
          <Image src={src} fill={true} style={{objectFit: "contain"}} alt={alt}/>
        </div>
      </div>
      <div onClick={handleClick} className="cursor-pointer transform transition-all duration-300 hover:scale-110">
        <Image src={src} width={width} height={height} alt={alt} />
      </div>
    </>
  );
};

export default FullscreenImageOverlay;
