import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";

export const alt = "JobNetWork guides and career calls for students and freshers";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOg({ label: "Guides", line: "Guides & career calls for students and freshers" });
}
