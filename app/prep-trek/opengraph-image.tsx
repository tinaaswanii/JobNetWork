import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "JobNetWork Prep Trek: interview prep";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ label: "Prep Trek", line: "Get interview-ready with Prep Trek" });
}
