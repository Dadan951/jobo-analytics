"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  return (
    <div className="w-full h-screen">
      <iframe
        width="100%"
        height="100%"
        src="https://lookerstudio.google.com/embed/reporting/8c0a9a71-c0f1-4174-b026-c2f21d5bf47f/page/p_h7qk4ulzhd"
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      ></iframe>
    </div>
  );
}
