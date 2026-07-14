export const mockUser = {
  id: "user_alex",
  name: "Alex Johnson",
  email: "alex@example.com",
  phone: "+1 (555) 234-5678",
  memberSince: "January 12, 2025",
  avatarUri: null,
  plan: "PRO PLAN"
};

export const mockSecuritySettings = {
  twoFactorAuthentication: true,
  biometricUnlock: true,
  autoScanOnOpen: false,
  safeMode: true,
  sessionTimeout: "30min"
};

export const mockNotificationPreferences = {
  threatAlerts: true,
  safeScanConfirmations: false,
  weeklySecurityDigest: true,
  appUpdates: true,
  promotionalOffers: false,
  scanReminders: false
};

export const mockScanHistory = [
  {
    id: "scan_001",
    domain: "stripe.com",
    url: "https://pay.stripe.com/checkout/abc123xyz",
    status: "safe",
    scannedAt: "2026-06-24T09:42:00+08:00"
  },
  {
    id: "scan_002",
    domain: "amaz0n-deals.ru",
    url: "http://amaz0n-deals.ru/promo",
    status: "blocked",
    scannedAt: "2026-06-24T08:17:00+08:00"
  },
  {
    id: "scan_003",
    domain: "github.com",
    url: "https://github.com/vafpqr/app",
    status: "safe",
    scannedAt: "2026-06-23T15:55:00+08:00"
  },
  {
    id: "scan_004",
    domain: "whatsapp.com",
    url: "https://wa.me/qr/ABCDEFG",
    status: "safe",
    scannedAt: "2026-06-23T11:20:00+08:00"
  },
  {
    id: "scan_005",
    domain: "discord.gg",
    url: "https://discord.gg/invite/vafpqr-demo",
    status: "safe",
    scannedAt: "2026-06-22T19:44:00+08:00"
  },
  {
    id: "scan_006",
    domain: "free-iphone15.win",
    url: "http://free-iphone15.win/claim",
    status: "blocked",
    scannedAt: "2026-06-22T14:11:00+08:00"
  }
];

export const mockSafeResult = {
  status: "safe",
  destinationUrl: "https://pay.stripe.com/checkout/abc123xyz",
  domain: "stripe.com",
  sslValid: true,
  threatCount: 0
};

export const mockWarningResult = {
  status: "blocked",
  destinationUrl: "http://amaz0n-deals.ru/promo",
  domain: "amaz0n-deals.ru",
  threatType: "Phishing / Credential Harvesting",
  riskLevel: "HIGH",
  reportedBy: 2847,
  reasons: [
    "Domain registered 3 days ago",
    "Impersonating Amazon brand assets",
    "SSL certificate from untrusted authority",
    "Redirects to credential harvesting form"
  ]
};
