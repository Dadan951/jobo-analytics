"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  return (
      <div className="w-full h-screen overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src="https://lookerstudio.google.com/embed/reporting/b58c05d6-dd66-4b27-9f21-4ffb8cdf448e/page/p_h7qk4ulzhd"
          allowFullScreen
          scrolling="no"
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        ></iframe>
      </div>
  );
}
