import type { Metadata } from "next";
import { SuccessBody } from "./Body";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default function Success() {
  return <SuccessBody />;
}
