import { createFileRoute } from "@tanstack/react-router";
import { Chamber } from "@/components/chamber/chamber";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Chamber />;
}
