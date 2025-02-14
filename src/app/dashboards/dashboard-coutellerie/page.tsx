"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        width="100%"
        height="100%"
        src="https://lookerstudio.google.com/embed/reporting/8b39da61-85df-4ed5-8a26-8cbeda3e01ed/page/p_gp0d4hp3hd"
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  );
}
