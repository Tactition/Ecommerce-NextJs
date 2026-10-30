import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
  render?: React.ReactElement<any>;
}

export function Button({
  className = "",
  variant = "default",
  render,
  children,
  ...props
}: ButtonProps) {
  const variantStyles =
    variant === "outline"
      ? "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
      : "bg-gray-900 text-white hover:bg-gray-800";

  if (render) {
    return React.cloneElement(render, {
      className: `${render.props.className || ""} ${variantStyles} ${className}`.trim(),
      children: render.props.children || children,
      ...props,
    });
  }

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors cursor-pointer focus:outline-none ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
