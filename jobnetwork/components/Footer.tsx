export default function Footer() {
  return (
    <footer className="mt-12 border-t px-6 py-8">
      <div className="text-center">
        <h3 className="text-sm font-semibold">Connect With Us</h3>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://www.linkedin.com/in/tinaaswanii/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#0A66C2] bg-[#0A66C2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#084f96]"
          >
            LinkedIn
          </a>

          <a
            href="https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#25D366] bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1da851]"
          >
            WhatsApp Community
          </a>

          <a
            href="https://wa.me/916262158299"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#25D366] bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1da851]"
          >
            Feedback
          </a>

          <a
            href="mailto:thedigitalldreamerr@gmail.com"
            className="rounded-lg border border-[#EA4335] bg-[#EA4335] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#c5221f]"
          >
            Email
          </a>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} JobNetWork. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
