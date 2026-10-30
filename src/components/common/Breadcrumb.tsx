import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  title: string;
  category?: string;
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ title, category = "Pages", items }: BreadcrumbProps) {
  return (
    <div className="breadcumb-section">
      <div
        className="breadcumb-container-wrapper"
        style={{
          backgroundImage: "url('/assets/images/breadcumb/breadcumb-bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="shape1">
          <img src="/assets/images/shape/breadcumb-shape1_1.png" alt="shape" />
        </div>
        <div className="shape2">
          <img src="/assets/images/shape/breadcumb-shape1_2.png" alt="shape" />
        </div>
        <div className="shape3">
          <img src="/assets/images/shape/breadcumb-shape1_3.png" alt="shape" />
        </div>
        <div className="shape4">
          <img src="/assets/images/shape/breadcumb-shape1_4.png" alt="shape" />
        </div>
        <div className="container">
          <ul className="breadcumb-wrapper">
            <li>
              <Link href="/" aria-label="Home">
                <i className="fa-sharp fa-light fa-house"></i>
              </Link>
            </li>
            <li>
              <i className="fa-solid fa-chevron-right"></i>
            </li>
            {items ? (
              items.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && (
                    <li>
                      <i className="fa-solid fa-chevron-right"></i>
                    </li>
                  )}
                  <li>
                    {item.href ? (
                      <Link href={item.href}>{item.label}</Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </li>
                </React.Fragment>
              ))
            ) : (
              <>
                <li>
                  <span>{category}</span>
                </li>
                <li>
                  <i className="fa-solid fa-chevron-right"></i>
                </li>
                <li>
                  <span>{title}</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
