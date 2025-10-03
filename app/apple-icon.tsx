import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "22%",
        }}
      >
        <svg
          width="140"
          height="140"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Candlestick 1 - Bullish */}
          <rect x="2" y="8" width="3" height="8" fill="#22c55e" rx="0.5" />
          <line
            x1="3.5"
            y1="6"
            x2="3.5"
            y2="8"
            stroke="#22c55e"
            strokeWidth="1"
          />
          <line
            x1="3.5"
            y1="16"
            x2="3.5"
            y2="18"
            stroke="#22c55e"
            strokeWidth="1"
          />

          {/* Candlestick 2 - Bearish */}
          <rect x="6" y="10" width="3" height="6" fill="#ef4444" rx="0.5" />
          <line
            x1="7.5"
            y1="7"
            x2="7.5"
            y2="10"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <line
            x1="7.5"
            y1="16"
            x2="7.5"
            y2="19"
            stroke="#ef4444"
            strokeWidth="1"
          />

          {/* Candlestick 3 - Bullish */}
          <rect x="10" y="7" width="3" height="9" fill="#22c55e" rx="0.5" />
          <line
            x1="11.5"
            y1="5"
            x2="11.5"
            y2="7"
            stroke="#22c55e"
            strokeWidth="1"
          />
          <line
            x1="11.5"
            y1="16"
            x2="11.5"
            y2="18"
            stroke="#22c55e"
            strokeWidth="1"
          />

          {/* Candlestick 4 - Bearish */}
          <rect x="14" y="11" width="3" height="5" fill="#ef4444" rx="0.5" />
          <line
            x1="15.5"
            y1="8"
            x2="15.5"
            y2="11"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <line
            x1="15.5"
            y1="16"
            x2="15.5"
            y2="19"
            stroke="#ef4444"
            strokeWidth="1"
          />

          {/* Candlestick 5 - Bullish */}
          <rect x="18" y="6" width="3" height="10" fill="#22c55e" rx="0.5" />
          <line
            x1="19.5"
            y1="4"
            x2="19.5"
            y2="6"
            stroke="#22c55e"
            strokeWidth="1"
          />
          <line
            x1="19.5"
            y1="16"
            x2="19.5"
            y2="18"
            stroke="#22c55e"
            strokeWidth="1"
          />

          {/* Trend line */}
          <path
            d="M 2 17 L 7.5 14 L 11.5 12 L 15.5 10 L 21 6"
            stroke="white"
            strokeWidth="2"
            fill="none"
            opacity="0.9"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
