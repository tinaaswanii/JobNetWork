// FREE Computer Networks cards shown on the website.
// The premium cards are NOT in this repo: they live only in the paid PDF.
import type { PrepCard } from "./types";

export const cnFreeCards: PrepCard[] = [
  {
    "id": "cn-osi-tcpip",
    "group": "Models & layers",
    "q": "OSI model vs TCP/IP model: what is the difference?",
    "say": "OSI is a 7-layer reference model for explaining networks. TCP/IP is the 4-layer model the internet actually runs on.",
    "picture": {
      "kind": "table",
      "head": [
        "OSI layer",
        "TCP/IP layer",
        "Example"
      ],
      "rows": [
        [
          "7 Application",
          "Application",
          "HTTP, DNS, SMTP"
        ],
        [
          "6 Presentation",
          "Application",
          "Encryption, encoding"
        ],
        [
          "5 Session",
          "Application",
          "Sessions, connections"
        ],
        [
          "4 Transport",
          "Transport",
          "TCP, UDP"
        ],
        [
          "3 Network",
          "Internet",
          "IP, ICMP"
        ],
        [
          "2 Data link",
          "Link",
          "Ethernet, Wi-Fi, MAC"
        ],
        [
          "1 Physical",
          "Link",
          "Cables, signals"
        ]
      ],
      "caption": "Memory trick, top to bottom: All People Seem To Need Data Processing."
    },
    "tryIt": {
      "prompt": "Which layer do TCP and UDP work at?",
      "options": [
        "Network",
        "Transport",
        "Application"
      ],
      "correct": 1,
      "why": "TCP and UDP deliver data between programs using port numbers. That is the transport layer (layer 4)."
    },
    "trap": "Saying the OSI model is what the internet uses. OSI is for teaching and troubleshooting. The internet runs on TCP/IP.",
    "sayIt": "OSI has 7 layers for explaining networks, and TCP/IP has 4 layers that the internet really uses. TCP and UDP sit at transport."
  },
  {
    "id": "cn-encapsulation",
    "group": "Models & layers",
    "q": "What is encapsulation?",
    "say": "Each layer wraps the data from the layer above with its own header, so the data grows a new label at every step down.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Application",
          "text": "Your data, such as an HTTP request."
        },
        {
          "title": "Transport",
          "text": "TCP adds port numbers. The unit is a segment (UDP: datagram)."
        },
        {
          "title": "Network",
          "text": "IP adds source and destination IP addresses. The unit is a packet."
        },
        {
          "title": "Data link",
          "text": "Ethernet adds MAC addresses. The unit is a frame."
        },
        {
          "title": "Physical",
          "text": "Frames become bits on the wire or in the air."
        }
      ],
      "caption": "The receiver does the reverse, removing one header per layer going up (decapsulation)."
    },
    "tryIt": {
      "prompt": "Which unit carries MAC addresses?",
      "options": [
        "Segment",
        "Packet",
        "Frame"
      ],
      "correct": 2,
      "why": "MAC addresses are added at the data link layer, and the unit there is a frame."
    },
    "trap": "Using segment, packet and frame as if they mean the same thing. Each belongs to a different layer.",
    "sayIt": "Each layer adds its own header: ports at transport, IP addresses at network, MAC addresses at data link."
  },
  {
    "id": "cn-tcp-vs-udp",
    "group": "Transport & TCP",
    "q": "TCP vs UDP: what is the difference?",
    "say": "TCP is reliable and ordered but slower to start. UDP is fast and light but gives no guarantees.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "TCP",
        "points": [
          "Sets up a connection first (3-way handshake)",
          "Resends lost data and keeps order",
          "Flow and congestion control",
          "Bigger header (20 bytes minimum)",
          "Web, email, file transfer"
        ]
      },
      "b": {
        "title": "UDP",
        "points": [
          "No connection setup",
          "No resending, no ordering",
          "No flow or congestion control",
          "Small header (8 bytes)",
          "DNS, video calls, gaming, streaming"
        ]
      },
      "caption": "UDP isn't 'bad'. If a late packet is useless anyway (live video), resending it only adds delay."
    },
    "tryIt": {
      "prompt": "Which suits a live video call better?",
      "options": [
        "TCP, because it never loses data",
        "UDP, because a late packet is useless anyway"
      ],
      "correct": 1,
      "why": "In a live call, resending an old packet only delays the new ones. UDP simply moves on."
    },
    "trap": "Saying UDP is unreliable so nobody should use it. Applications can add their own checks on top of UDP when they need to.",
    "sayIt": "TCP is connection-based and reliable, UDP is connectionless and fast. I pick UDP when speed matters more than every packet."
  },
  {
    "id": "cn-handshake",
    "group": "Transport & TCP",
    "q": "How does the TCP 3-way handshake work?",
    "say": "Both sides agree they can hear each other, and agree on starting sequence numbers, before any data moves.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "SYN",
          "text": "Client says: I want to connect, my sequence number starts at x."
        },
        {
          "title": "SYN-ACK",
          "text": "Server says: OK, mine starts at y, and I expect your x + 1."
        },
        {
          "title": "ACK",
          "text": "Client says: got it, I expect your y + 1. Data can now flow."
        }
      ],
      "caption": "Two messages wouldn't be enough: the server needs proof the client received its sequence number."
    },
    "tryIt": {
      "prompt": "Which step does the server send?",
      "options": [
        "SYN",
        "SYN-ACK",
        "ACK"
      ],
      "correct": 1,
      "why": "The server replies to the client's SYN with SYN-ACK: it acknowledges the client and sends its own SYN."
    },
    "trap": "Mixing up which side sends which message. Client: SYN, then ACK. Server: SYN-ACK.",
    "sayIt": "SYN, SYN-ACK, ACK. It sets up the connection and agrees the starting sequence numbers."
  },
  {
    "id": "cn-ip-mac",
    "group": "IP, addressing & routing",
    "q": "IP address vs MAC address: what is the difference?",
    "say": "A MAC address identifies the network card on the local link. An IP address says where a device sits in the network.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "MAC address",
        "points": [
          "48 bits, written as 6 hex pairs",
          "Built into the network card",
          "Works on the local link (layer 2)",
          "Changes at every hop"
        ]
      },
      "b": {
        "title": "IP address",
        "points": [
          "32 bits (IPv4) or 128 bits (IPv6)",
          "Assigned by the network (DHCP or manually)",
          "Used for routing across networks (layer 3)",
          "Stays the same end to end (without NAT)"
        ]
      },
      "caption": "Think of the IP address as the postal address and the MAC address as the person at the door."
    },
    "tryIt": {
      "prompt": "A packet crosses three routers. What changes at each hop?",
      "options": [
        "The source and destination IP",
        "The source and destination MAC",
        "Nothing"
      ],
      "correct": 1,
      "why": "Each hop rewrites the frame's MAC addresses for the next link. The IP addresses stay the same (unless NAT rewrites them)."
    },
    "trap": "Saying the MAC address is permanent and can't be changed. It can be spoofed, so never treat it as security.",
    "sayIt": "MAC is hardware, local and changes at every hop. IP is logical, used for routing and stays the same end to end."
  },
  {
    "id": "cn-subnet-cidr",
    "group": "IP, addressing & routing",
    "q": "What is a subnet and what does /24 mean?",
    "say": "A subnet is a smaller slice of a network. /24 means the first 24 bits are the network part and the last 8 are for hosts.",
    "picture": {
      "kind": "chips",
      "items": [
        {
          "label": "/24",
          "note": "Mask 255.255.255.0. 8 host bits give 256 addresses."
        },
        {
          "label": "Network address",
          "note": "All host bits 0. Names the subnet. Not usable by a device."
        },
        {
          "label": "Broadcast address",
          "note": "All host bits 1. Reaches every host. Not usable by a device."
        },
        {
          "label": "Usable hosts",
          "note": "2^(32 - prefix) - 2. For /24 that is 254."
        }
      ],
      "code": "192.168.1.0/24\nnetwork    192.168.1.0\nusable     192.168.1.1 to 192.168.1.254\nbroadcast  192.168.1.255"
    },
    "tryIt": {
      "prompt": "How many usable hosts does a /26 have?",
      "options": [
        "64",
        "62",
        "26"
      ],
      "correct": 1,
      "why": "A /26 leaves 6 host bits: 2^6 = 64 addresses. Take away the network and broadcast addresses and 62 are usable."
    },
    "trap": "Forgetting to subtract the 2 for the network and broadcast addresses.",
    "sayIt": "Usable hosts are 2 to the power of the host bits, minus 2. A /24 has 254 and a /26 has 62."
  },
  {
    "id": "cn-dns",
    "group": "Application protocols",
    "q": "How does DNS turn a name into an IP address?",
    "say": "DNS is the internet's phone book. If nothing is cached, a resolver asks the root, then the TLD, then the authoritative server.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "Check caches",
          "text": "Browser, then operating system. If found, stop."
        },
        {
          "title": "Ask the resolver",
          "text": "Your ISP or a public one such as 8.8.8.8. It checks its own cache too."
        },
        {
          "title": "Root server",
          "text": "Replies: for .com, ask the .com servers."
        },
        {
          "title": "TLD server",
          "text": "Replies: for example.com, ask its authoritative server."
        },
        {
          "title": "Authoritative server",
          "text": "Holds the real record and returns the IP."
        },
        {
          "title": "Cache it",
          "text": "Everyone keeps the answer until its TTL runs out."
        }
      ],
      "caption": "Records you will hear about: A (name to IPv4), AAAA (IPv6), CNAME (alias), MX (mail), NS (name servers)."
    },
    "tryIt": {
      "prompt": "Which DNS record points a name to an IPv4 address?",
      "options": [
        "A",
        "MX",
        "CNAME"
      ],
      "correct": 0,
      "why": "An A record maps a name to an IPv4 address. AAAA is the IPv6 version. MX is for mail and CNAME is an alias."
    },
    "trap": "Saying a request always goes to the root server. Caches answer most lookups before that.",
    "sayIt": "DNS maps names to IPs. The resolver asks root, then TLD, then authoritative, and caches the answer for its TTL."
  },
  {
    "id": "cn-http-vs-https",
    "group": "Application protocols",
    "q": "HTTP vs HTTPS: what is the difference?",
    "say": "HTTPS is HTTP carried inside TLS. Same requests, but encrypted, tamper-proof and with the server's identity checked.",
    "picture": {
      "kind": "compare",
      "a": {
        "title": "HTTP",
        "points": [
          "Port 80",
          "Plain text: anyone on the path can read it",
          "Can be modified in transit",
          "No proof of who the server is"
        ]
      },
      "b": {
        "title": "HTTPS",
        "points": [
          "Port 443",
          "Encrypted with TLS",
          "Tampering is detected",
          "Server proves identity with a certificate"
        ]
      },
      "caption": "The padlock means the connection is encrypted. It doesn't mean the site is trustworthy."
    },
    "tryIt": {
      "prompt": "What does the padlock in the browser prove?",
      "options": [
        "The site is safe and honest",
        "The connection is encrypted and the domain matches its certificate"
      ],
      "correct": 1,
      "why": "HTTPS protects the connection and checks the domain. A scam site can have a valid certificate too."
    },
    "trap": "Saying HTTPS means the website is safe. It only means the connection is protected.",
    "sayIt": "HTTPS is HTTP over TLS on port 443, giving encryption, integrity and server authentication."
  },
  {
    "id": "cn-status-codes",
    "group": "Application protocols",
    "q": "What do the HTTP status codes mean?",
    "say": "The first digit tells you the story: 2 worked, 3 go elsewhere, 4 your mistake, 5 the server's mistake.",
    "picture": {
      "kind": "table",
      "head": [
        "Code",
        "Meaning",
        "When"
      ],
      "rows": [
        [
          "200 OK",
          "Success",
          "Page returned"
        ],
        [
          "301 / 302",
          "Moved permanently / temporarily",
          "Redirects"
        ],
        [
          "400",
          "Bad request",
          "Malformed request"
        ],
        [
          "401",
          "Unauthorized",
          "Not logged in"
        ],
        [
          "403",
          "Forbidden",
          "Logged in, not allowed"
        ],
        [
          "404",
          "Not found",
          "No such page"
        ],
        [
          "500",
          "Internal server error",
          "Server crashed"
        ],
        [
          "503",
          "Service unavailable",
          "Overloaded or down"
        ]
      ],
      "caption": "GET reads, POST creates, PUT replaces, DELETE removes. GET, PUT and DELETE are idempotent."
    },
    "tryIt": {
      "prompt": "A logged-in user opens an admin page they have no rights to. Which code fits?",
      "options": [
        "401",
        "403",
        "404"
      ],
      "correct": 1,
      "why": "403 means the server knows who you are and still refuses. 401 means you haven't authenticated."
    },
    "trap": "Mixing up 401 and 403. 401 is who are you, 403 is you may not.",
    "sayIt": "2xx success, 3xx redirect, 4xx client error, 5xx server error. 401 means not logged in, 403 means not allowed."
  },
  {
    "id": "cn-type-a-url",
    "group": "Application protocols",
    "q": "What happens when you type a URL and press Enter?",
    "say": "The browser finds the IP with DNS, opens a TCP connection, secures it with TLS, sends the request and renders the reply.",
    "picture": {
      "kind": "steps",
      "steps": [
        {
          "title": "DNS lookup",
          "text": "Turn the name into an IP address (caches first)."
        },
        {
          "title": "TCP handshake",
          "text": "SYN, SYN-ACK, ACK with the server, usually on port 443."
        },
        {
          "title": "TLS handshake",
          "text": "Agree on encryption and check the server's certificate."
        },
        {
          "title": "HTTP request",
          "text": "The browser sends GET / with headers and cookies."
        },
        {
          "title": "Response",
          "text": "The server returns status, headers and HTML."
        },
        {
          "title": "Render",
          "text": "The browser loads CSS, scripts and images, then draws the page."
        }
      ],
      "caption": "Your own machine uses ARP and the default gateway to reach the first router on the way."
    },
    "tryIt": {
      "prompt": "Which step needs the IP address, so it must come first?",
      "options": [
        "TCP handshake",
        "DNS lookup",
        "Render"
      ],
      "correct": 1,
      "why": "To connect, the browser needs an IP address. DNS provides it, so the lookup comes before anything else."
    },
    "trap": "Skipping DNS or TLS in the explanation. Interviewers listen for each layer.",
    "sayIt": "DNS, TCP handshake, TLS, HTTP request, server response, then the browser renders the page."
  }
];
