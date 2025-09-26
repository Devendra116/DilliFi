"use client";

import { useRouter } from "next/navigation";
import { HomePage } from "@/components/HomePage";

export default function Page() {
  const router = useRouter();

  const handleViewChange = (view: string) => {
    switch (view) {
      case "home":
        router.push("/");
        break;
      case "marketplace":
        router.push("/marketplace");
        break;
      case "create":
        router.push("/create-stragety");
        break;
      case "dashboard":
        router.push("/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  return <HomePage onViewChange={handleViewChange} />;
}
