// FREE Computer Networks cards shown on the website.
// The premium cards are NOT in this repo: they live only in the paid PDF.
import type { PrepCard } from "./types";

export const cnFreeCards: PrepCard[] = [
  {
    id: "cn-osi",
    group: "Basics",
    q: "What are the 7 layers of the OSI model?",
    say: "A 7-layer reference model, from the physical wire at the bottom to the application at the top. Each layer only talks to the one directly above and below it.",
    picture: {
      kind: "table",
      head: ["#", "Layer", "Does what"],
      rows: [
        ["7", "Application", "What the user's app actually uses — HTTP, SMTP, FTP"],
        ["6", "Presentation", "Formats/encrypts data — SSL/TLS, encoding"],
        ["5", "Session", "Opens, manages and closes a connection"],
        ["4", "Transport", "End-to-end delivery — TCP, UDP"],
        ["3", "Network", "Routing between networks — IP, routers"],
        ["2", "Data Link", "Node-to-node delivery on one network — MAC, switches"],
        ["1", "Physical", "Actual bits on the wire/radio — cables, signals"],
      ],
      caption: 'Mnemonic: "All People Seem To Need Data Processing" (7→1).',
    },
    tryIt: {
      prompt: "A router mainly operates at which layer?",
      options: ["Layer 3 (Network)", "Layer 2 (Data Link)", "Layer 7 (Application)"],
      correct: 0,
      why: "Routers decide where a packet goes next based on IP addresses — that's Layer 3. Switches work at Layer 2, using MAC addresses instead.",
    },
    trap: "Reciting all 7 layers without being able to say what any of them actually do. Interviewers usually only care that you can place TCP/IP and HTTP correctly.",
    sayIt:
      "OSI is a 7-layer model from physical wires up to the application; each layer only talks to its direct neighbours.",
  },
  {
    id: "cn-tcpip-vs-osi",
    group: "Basics",
    q: "How does the TCP/IP model map to OSI?",
    say: "TCP/IP is the 4-layer model actually used on the real internet — it collapses OSI's top three layers into one, and its bottom two into one.",
    picture: {
      kind: "compare",
      a: {
        title: "OSI (7 layers)",
        points: [
          "Application",
          "Presentation",
          "Session",
          "Transport",
          "Network",
          "Data Link",
          "Physical",
        ],
      },
      b: {
        title: "TCP/IP (4 layers)",
        points: [
          "Application (= App+Pres+Session)",
          "Transport",
          "Internet (= Network)",
          "Network Access (= Data Link+Physical)",
        ],
      },
      caption:
        "OSI is the teaching model; TCP/IP is what's actually implemented and running the internet.",
    },
    tryIt: {
      prompt: "Which model does the real internet actually run on?",
      options: ["TCP/IP", "OSI", "Both equally, in parallel"],
      correct: 0,
      why: "OSI is a conceptual reference model used for teaching and troubleshooting. The internet's real protocol stack is TCP/IP.",
    },
    trap: 'Saying OSI and TCP/IP are the same thing, or that the internet "runs on OSI." OSI is the map; TCP/IP is the territory.',
    sayIt:
      "TCP/IP is the 4-layer model the internet actually runs on — OSI is the 7-layer teaching reference it maps onto.",
  },
  {
    id: "cn-tcp-vs-udp",
    group: "Transport",
    q: "TCP vs UDP — what's the difference?",
    say: "TCP is connection-oriented and reliable — it guarantees delivery and order, at the cost of overhead. UDP is connectionless and fast, with no delivery guarantee.",
    picture: {
      kind: "compare",
      a: {
        title: "TCP",
        points: [
          "Connection-oriented (handshake first)",
          "Reliable — guarantees delivery & order",
          "Slower, more overhead",
          "Used by: HTTP, HTTPS, email, file transfer",
        ],
      },
      b: {
        title: "UDP",
        points: [
          "Connectionless — no handshake",
          "No delivery guarantee",
          "Fast, low overhead",
          "Used by: video calls, DNS, gaming, streaming",
        ],
      },
    },
    tryIt: {
      prompt: "Why would a video call use UDP instead of TCP?",
      options: [
        "A dropped frame is fine — waiting for TCP to retransmit it would lag the whole call more than just skipping it",
        "UDP is more secure than TCP",
        "UDP guarantees the video arrives in order",
      ],
      correct: 0,
      why: "Real-time traffic prefers a dropped frame over a delay. TCP's retransmission-and-reorder guarantee is exactly what you don't want when the data is only useful if it arrives on time.",
    },
    trap: 'Saying UDP is "worse" than TCP. It\'s a trade-off, not a downgrade — each is the right choice for different traffic.',
    sayIt:
      "TCP trades speed for reliability with a handshake and delivery guarantees; UDP trades reliability for speed with none of that overhead.",
  },
  {
    id: "cn-handshake",
    group: "Transport",
    q: "Walk me through the TCP three-way handshake.",
    say: "Three steps before any data moves: SYN, SYN-ACK, ACK — both sides confirm they're ready and agree on starting sequence numbers.",
    picture: {
      kind: "steps",
      steps: [
        {
          title: "SYN",
          text: "Client sends a SYN packet: \"I'd like to connect, here's my starting sequence number.\"",
        },
        {
          title: "SYN-ACK",
          text: 'Server replies with SYN-ACK: "Got it, here\'s my starting sequence number too."',
        },
        {
          title: "ACK",
          text: 'Client sends ACK: "Confirmed." The connection is now open and data can flow.',
        },
      ],
      caption:
        "Closing a connection is a separate 4-step FIN/ACK exchange, not the reverse of this.",
    },
    tryIt: {
      prompt: "What does the handshake actually establish before data is sent?",
      options: [
        "Both sides are reachable and agree on starting sequence numbers",
        "The encryption key for the whole session",
        "The maximum file size that can be transferred",
      ],
      correct: 0,
      why: "The handshake confirms both ends are alive and synchronizes sequence numbers for reliable, ordered delivery. Encryption (TLS) is a separate handshake layered on top, for HTTPS.",
    },
    trap: "Confusing the TCP handshake with the TLS/SSL handshake (which negotiates encryption for HTTPS) — they're two different handshakes, back to back.",
    sayIt:
      "TCP opens a connection with a 3-step SYN, SYN-ACK, ACK handshake before any actual data is sent.",
  },
  {
    id: "cn-ip-addressing",
    group: "Addressing",
    q: "What's a subnet mask actually for?",
    say: 'A subnet mask splits an IP address into a network part and a host part — it tells devices which addresses are "local" versus need routing.',
    picture: {
      kind: "table",
      head: ["Notation", "Meaning"],
      rows: [
        ["192.168.1.10", "An IP address — identifies one device"],
        ["255.255.255.0", "Subnet mask — first 3 octets are network, last is host"],
        ["192.168.1.0/24", "CIDR notation — same mask, written as a prefix length"],
        ["192.168.1.255", "Broadcast address for this subnet — reaches every host on it"],
      ],
      caption: "/24 = 24 bits of network, 8 bits left for hosts = up to 254 usable host addresses.",
    },
    tryIt: {
      prompt:
        "Two devices are on 192.168.1.10/24 and 192.168.1.20/24. Can they talk directly, without a router?",
      options: [
        "Yes — same network, same subnet",
        "No — different networks",
        "Only if they're both wired, not Wi-Fi",
      ],
      correct: 0,
      why: "Both addresses share the same /24 network portion (192.168.1.x), so they're on the same local subnet and can communicate directly without routing.",
    },
    trap: 'Treating the IP address alone as enough information — without the subnet mask, you can\'t tell which devices are "local" to each other.',
    sayIt:
      "The subnet mask splits an IP into network + host parts, which is how a device knows if another address is local or needs a router.",
  },
  {
    id: "cn-public-private-nat",
    group: "Addressing",
    q: "Public vs private IP — and what does NAT do?",
    say: "Private IPs (like 192.168.x.x) only work inside your local network. NAT translates them to one public IP so your whole home network can share a single internet-facing address.",
    picture: {
      kind: "compare",
      a: {
        title: "Private IP",
        points: [
          "Ranges: 10.x, 172.16-31.x, 192.168.x",
          "Only routable within a local network",
          "Free to reuse — every home network uses 192.168.1.x",
        ],
      },
      b: {
        title: "Public IP",
        points: [
          "Globally unique, assigned by your ISP",
          "Routable across the internet",
          "Usually one per household/router",
        ],
      },
      caption:
        "NAT (Network Address Translation) is what sits at your router, swapping private IPs for the one public IP on the way out.",
    },
    tryIt: {
      prompt: "Why can every home network reuse 192.168.1.1 for its router without conflicts?",
      options: [
        "Because private IP ranges are never routed on the public internet, so they can repeat everywhere",
        "Because 192.168.1.1 is reserved specifically for routers worldwide",
        "Because ISPs randomly assign it only once per city",
      ],
      correct: 0,
      why: "Private address ranges are explicitly excluded from internet routing, so there's no global conflict — they only need to be unique inside their own local network.",
    },
    trap: "Assuming a private IP (192.168.x.x) is directly reachable from the internet. It isn't — NAT at the router is what makes outbound traffic work at all.",
    sayIt:
      "Private IPs are only valid inside a local network; NAT at the router translates them to one shared public IP for internet traffic.",
  },
  {
    id: "cn-dns",
    group: "DNS",
    q: "Walk me through what happens during a DNS lookup.",
    say: "Your browser needs an IP address for a domain name, so it asks a chain of DNS servers — usually resolved in milliseconds and cached afterward.",
    picture: {
      kind: "steps",
      steps: [
        {
          title: "Browser/OS cache",
          text: "Check if this domain's IP was already looked up recently.",
        },
        {
          title: "Recursive resolver",
          text: "If not cached, ask your ISP's (or 8.8.8.8-style) DNS resolver.",
        },
        {
          title: "Root → TLD → authoritative",
          text: "The resolver walks the DNS hierarchy: root server → .com's TLD server → the domain's own authoritative server.",
        },
        {
          title: "Answer returned & cached",
          text: "The IP comes back, the browser connects to it, and the result is cached for next time.",
        },
      ],
      caption:
        'This whole chain is why a DNS change can take time to "propagate" — caches at every step need to expire.',
    },
    tryIt: {
      prompt: "You just changed a domain's DNS record, but visitors still see the old server. Why?",
      options: [
        "DNS caching (TTL) — old records are still cached somewhere in the chain until they expire",
        "DNS changes are instant and this shouldn't be possible",
        "The domain needs to be re-purchased",
      ],
      correct: 0,
      why: 'Every DNS record has a TTL (time to live). Resolvers and browsers cache the old answer until that TTL expires, which is exactly why DNS changes "propagate" gradually rather than instantly.',
    },
    trap: "Expecting DNS changes to take effect immediately everywhere. TTL-based caching is a feature, not a bug — it's what keeps the whole system fast.",
    sayIt:
      "DNS resolves a domain to an IP by walking root → TLD → authoritative servers, caching the answer at every step based on its TTL.",
  },
  {
    id: "cn-http-vs-https",
    group: "Web",
    q: "HTTP vs HTTPS — what does the 'S' actually add?",
    say: "HTTPS is HTTP wrapped in TLS encryption — the 'S' adds confidentiality, integrity and a verified identity for the server you're talking to.",
    picture: {
      kind: "compare",
      a: {
        title: "HTTP",
        points: [
          "Port 80",
          "Plain text — readable by anyone intercepting it",
          "No identity verification",
        ],
      },
      b: {
        title: "HTTPS",
        points: ["Port 443", "Encrypted via TLS", "Server identity verified by a certificate"],
      },
      caption:
        "The TLS handshake (certificate exchange + key negotiation) happens after the TCP handshake, before any HTTP request is sent.",
    },
    tryIt: {
      prompt:
        "An attacker on the same public Wi-Fi intercepts your traffic. What can they read on an HTTP site vs an HTTPS one?",
      options: [
        "HTTP: everything in plain text. HTTPS: only that a connection exists, not its contents",
        "Both are equally readable — Wi-Fi interception bypasses encryption",
        "HTTPS is only about the padlock icon, not actual encryption",
      ],
      correct: 0,
      why: "TLS encrypts the payload, so an eavesdropper on HTTPS traffic sees only that a connection to a given server exists — not the actual request/response content, which is exactly what HTTP exposes.",
    },
    trap: "Thinking HTTPS means a site is trustworthy. It only guarantees the connection is encrypted and the certificate is valid — not that the site's content itself is legitimate.",
    sayIt:
      "HTTPS is HTTP over TLS — it encrypts the traffic and verifies the server's identity via a certificate; plain HTTP does neither.",
  },
  {
    id: "cn-common-ports",
    group: "Basics",
    q: "What are the common port numbers interviewers expect you to know?",
    say: "A handful of ports come up constantly — know these cold, you'll use them to reason about firewalls, URLs and traffic.",
    picture: {
      kind: "table",
      head: ["Port", "Protocol"],
      rows: [
        ["20/21", "FTP"],
        ["22", "SSH"],
        ["25", "SMTP (email sending)"],
        ["53", "DNS"],
        ["80", "HTTP"],
        ["443", "HTTPS"],
        ["3306", "MySQL"],
        ["5432", "PostgreSQL"],
      ],
      caption:
        'A port number is just the "which service on this machine" part of an address — the IP gets you to the machine, the port gets you to the right service.',
    },
    tryIt: {
      prompt: "A firewall blocks outbound port 443. What breaks?",
      options: [
        "Almost all HTTPS browsing — most of the modern web",
        "Only email",
        "Only file transfers",
      ],
      correct: 0,
      why: "443 is HTTPS — blocking it breaks secure web browsing across virtually every modern site, since HTTPS is now the default for the web.",
    },
    trap: "Mixing up 80/443 (web) with 25 (email) or 22 (SSH) under interview pressure — these come up fast in rapid-fire rounds, so drill them until they're automatic.",
    sayIt:
      "80 is HTTP, 443 is HTTPS, 22 is SSH, 53 is DNS — the handful of ports worth knowing cold.",
  },
  {
    id: "cn-router-switch-hub",
    group: "Routing",
    q: "Router vs switch vs hub — what's the actual difference?",
    say: "A hub blindly repeats data to every port. A switch is smarter — it learns MAC addresses and sends data only to the right port. A router connects separate networks and decides the path between them.",
    picture: {
      kind: "compare",
      a: {
        title: "Switch (Layer 2)",
        points: [
          "Connects devices within one local network",
          "Learns MAC addresses, forwards only to the right port",
          "Hub does the same job but dumbly — floods every port instead",
        ],
      },
      b: {
        title: "Router (Layer 3)",
        points: [
          "Connects separate networks together",
          "Routes traffic based on IP addresses",
          "What actually gets your home network onto the internet",
        ],
      },
    },
    tryIt: {
      prompt:
        "Your laptop and printer are both plugged into the same switch and can print fine. Why don't you need a router for that?",
      options: [
        "They're on the same local network — a switch alone handles communication within one network",
        "Switches have built-in internet access",
        "Printers don't need network devices at all",
      ],
      correct: 0,
      why: "A switch is enough to move traffic between devices on the same local network. A router is only needed once you need to reach a different network — like the internet.",
    },
    trap: 'Calling a home "router" just a router — most consumer boxes are actually a router + switch + Wi-Fi access point combined into one device.',
    sayIt:
      "A switch moves traffic within one local network using MAC addresses; a router connects separate networks using IP addresses.",
  },
];
