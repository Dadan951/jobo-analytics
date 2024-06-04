import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <h1>Jobo Analytics</h1>
        <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/cd98bd90-42bd-4bf6-a3ed-376a8c65e8c6/page/ASK0D" frameborder="0" style={{border:0}} allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
      </div>
    </main>
  );
}
