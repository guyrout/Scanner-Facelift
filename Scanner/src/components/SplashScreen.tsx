import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const SPLASH_DURATION_MS = 3200;
const FADE_DURATION_S = 0.8;
const SHIMMER_DELAY_S = 0.6;

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="153" height="61" viewBox="0 0 153 61" fill="white"><path d="M137.864 43.0904C137.87 40.7452 137.41 38.4222 136.511 36.2561C135.611 34.0899 134.291 32.1238 132.625 30.4718C129.163 27.0221 124.443 25.1232 119.328 25.1232C114.217 25.1232 109.493 27.0221 106.035 30.4718C104.375 32.1254 103.06 34.0927 102.168 36.2591C101.275 38.4255 100.824 40.7477 100.838 43.0904C100.838 47.9445 102.606 52.4304 105.895 55.7256C109.287 59.1257 114.06 61 119.328 61C124.596 61 129.369 59.1257 132.765 55.7256C136.05 52.4304 137.864 47.9445 137.864 43.0904ZM129.538 43.0904C129.538 48.5912 124.769 53.4169 119.328 53.4169C113.891 53.4169 109.118 48.5912 109.118 43.0904C109.108 41.7124 109.372 40.3462 109.896 39.0715C110.42 37.7967 111.192 36.639 112.168 35.6659C114.068 33.7695 116.643 32.7043 119.328 32.7043C122.013 32.7043 124.588 33.7695 126.488 35.6659C127.465 36.6384 128.238 37.7961 128.761 39.0709C129.285 40.3458 129.549 41.7123 129.538 43.0904ZM87.4752 34.4856H97.6375V25.8625H78.8484V60.4006H87.4752V34.4856ZM44.8956 46.3917H71.9884V45.1789C71.9884 39.3545 70.2656 34.352 67.0053 30.7128C63.7737 27.1086 59.1572 25.1232 54.0091 25.1232C48.9433 25.1232 44.3598 27.0119 41.1121 30.4429C37.9916 33.7362 36.2729 38.2053 36.2729 43.0305C36.2729 47.7511 37.9752 52.1583 41.0624 55.4393C44.4876 59.0763 49.2812 61 54.9283 61C60.6369 61 65.3442 58.8642 69.6761 54.2984L64.1403 48.7559C61.5149 51.8063 58.3081 53.4169 54.8664 53.4169C52.1626 53.4169 49.7553 52.5908 47.9047 51.0258C46.4677 49.8102 45.421 48.1984 44.8956 46.3917ZM44.8587 39.4225C45.7696 36.0736 48.5353 32.7043 53.9473 32.7043C58.473 32.7043 62.0466 35.4064 63.0647 39.4225H44.8587ZM29.1952 17.2413H41.132V8.62031H8.63139V17.2413H20.5681V60.4006H29.1952V17.2413Z"/><path d="M87.4752 34.4856H97.6375V25.8625H78.8484V60.4006H87.4752V34.4856Z"/><path d="M8.62684 25.8625H0V60.4006H8.62684V25.8625Z"/><path d="M8.62683 0H0V8.62099H8.62683V0Z"/><path d="M140.507 25.8518H145.728V26.8797H143.713V32.2792H142.511V26.8797H140.507V25.8518Z"/><path d="M146.568 25.8518H148.15L149.205 28.9112C149.456 29.6616 149.767 31.0692 149.767 31.0692H149.794C149.794 31.0692 150.105 29.6705 150.347 28.9112L151.383 25.8518H153V32.2792H151.885V28.9267C151.885 28.2273 151.962 26.9241 151.962 26.9241H151.945C151.945 26.9241 151.678 28.1075 151.469 28.7469L150.252 32.2792H149.283L148.057 28.7469C147.848 28.1075 147.581 26.9241 147.581 26.9241H147.564C147.564 26.9241 147.641 28.2274 147.641 28.9267V32.2792H146.568V25.8518Z"/></svg>`;

const maskUrl = `url("data:image/svg+xml,${encodeURIComponent(LOGO_SVG)}")`;

function ShimmerLogo() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{ width: 170, height: 68 }}
    >
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          background:
            "white linear-gradient(to right, white 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.5) 60%, white 100%)",
          backgroundSize: "50% 200%",
          backgroundRepeat: "no-repeat",
          maskImage: maskUrl,
          WebkitMaskImage: maskUrl,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        } as React.CSSProperties}
        initial={{ backgroundPositionX: "250%" }}
        animate={{ backgroundPositionX: ["-100%", "250%"] }}
        transition={{
          duration: 1.5,
          delay: SHIMMER_DELAY_S,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: "linear",
        }}
      />
    </motion.div>
  );
}

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION_S, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShimmerLogo />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
