import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full">

      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url('/public/dash_back.jpg')",
        }}
      ></div>

      <div className="relative z-10 pt-20 flex flex-col items-center">

        <h1 className="text-4xl font-bold text-white drop-shadow mb-10">
          Welcome to the System
        </h1>

        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-10 max-w-3xl text-center shadow-xl">
          <h2 className="text-4xl font-extrabold mb-3 text-white">Grocery MIS</h2>
          <p className="text-gray-300 mb-6">University Project</p>

          <div className="flex gap-3 justify-center">
            <Link
              to="/products"
              className="px-5 py-3 bg-sky-600 text-white rounded-lg font-medium shadow"
            >
              Products
            </Link>

            <Link
              to="/invoices"
              className="px-5 py-3 bg-amber-500 text-white rounded-lg font-medium shadow"
            >
              Invoices
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
