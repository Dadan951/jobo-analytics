"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle form submission

    const username = email;

    console.log(username, password);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("Invalid email or password");
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      const sector = data.user.sector;
      
      let redirectUrl = "/";
      switch (sector) {
        case "textile":
          redirectUrl = "/dashboards/dashboard-textile";
          break;
        case "verre":
          redirectUrl = "/dashboards/dashboard-verre";
          break;
        case "luxe":
          redirectUrl = "/dashboards/dashboard-luxe";
          break;
        case "coutellerie":
          redirectUrl = "/dashboards/dashboard-coutellerie";
          break;
        default:
          redirectUrl = "/";
          break;
      }
      router.push(redirectUrl);
    } catch (error) {
      console.log("error");
      setError("Invalid email or password");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-1/3 bg-white p-8 rounded shadow-md"
    >
      <h2 className="text-2xl mb-4">Se connecter</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full h-10 px-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full h-10 px-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Se connecter
      </button>
    </form>
  );
}
