"use client";

import React, { createContext, useContext } from "react";

interface TabsContextType {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = createContext<TabsContextType>({ value: "" });

export function Tabs({
  value,
  onValueChange,
  className = "",
  children,
}: {
  value: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`flex ${className}`}>{children}</div>;
}

export function TabsTab({
  value,
  className = "",
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      data-active={isActive ? "true" : undefined}
      onClick={() => ctx.onValueChange?.(value)}
      className={`${className}`}
    >
      {children}
    </button>
  );
}

export function TabsPanel({
  value,
  className = "",
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={className}>{children}</div>;
}
