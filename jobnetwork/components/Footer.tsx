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
            className="rounded-lg border px-4 py-2 text-sm transition hover:underline"
          >
            LinkedIn
          </a>

          <a
            href="https://chat.whatsapp.com/L9DG89VrT4V2UFjFkpv0Ok"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-4 py-2 text-sm transition hover:underline"
          >
            WhatsApp Community
          </a>

          <a
            href="https://wa.me/916262158299"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border px-4 py-2 text-sm transition hover:underline"
          >
            Feedback
          </a>

          <a
            href="mailto:thedigitalldreamerr@gmail.com"
            className="rounded-lg border px-4 py-2 text-sm transition hover:underline"
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
