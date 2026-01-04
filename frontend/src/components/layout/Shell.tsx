import React from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="grid grid-cols-12 gap-4 pt-24">
          <div className="col-span-12 lg:col-span-3 xl:col-span-2">
            <Sidebar />
          </div>
          <main className="col-span-12 lg:col-span-9 xl:col-span-10 pb-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
