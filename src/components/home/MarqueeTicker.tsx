import React from "react";

export default function MarqueeTicker() {
  const items = [
    "Architectural Exclusive Offer",
    "Special Trade Discount for Contractors & Dealers",
    "Bespoke Handcrafted Furniture",
    "Acoustic Slat Wood Wall Paneling",
    "Turnkey Modular Kitchens & Wardrobes",
    "Complimentary 3D Interior Consultation in Srinagar",
    "Authorized Hafele & Hettich Hardware Partner",
    "B2B Wholesale Trade Supply Across Kashmir",
  ];

  return (
    <div className="marquee-section1 pt-20 pb-20" style={{ overflow: "hidden", background: "#FAFBFD" }}>
      <div className="container-fluid px-0">
        <div className="mycustom-marque">
          <div
            className="scrolling-wrap d-flex align-items-center"
            style={{
              whiteSpace: "nowrap",
              animation: "marqueeScroll 35s linear infinite",
            }}
          >
            {[...items, ...items].map((text, idx) => (
              <div key={idx} className="d-inline-flex align-items-center" style={{ marginRight: "40px" }}>
                <img
                  src="/assets/images/icon/starIcon1_1.svg"
                  alt="star"
                  style={{ width: "16px", height: "16px", marginRight: "14px" }}
                />
                <span
                  className="cmn-textslide"
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#0A111E",
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
