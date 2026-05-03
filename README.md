# BookVerse — চালানোর নিয়ম

## ধাপ ১ — Dependencies install করো

```bash
npm install
```

## ধাপ ২ — Clerk Keys বসাও

`.env.local` ফাইলটা খোলো (আগে থেকেই আছে)।

**Clerk keys পেতে:**
1. https://clerk.com এ যাও → Sign Up করো (free)
2. "Create Application" → নাম দাও **BookVerse** → Continue
3. বাম দিকে **"API Keys"** click করো
4. **Publishable Key** এবং **Secret Key** copy করো
5. `.env.local` ফাইলে `pk_test_xxx...` এবং `sk_test_xxx...` এর জায়গায় paste করো

## ধাপ ৩ — Database schema push করো

```bash
npm run db:push
```

## ধাপ ৪ — App চালাও

```bash
npm run dev
```

Browser এ যাও: **http://localhost:3000**

---

## সমস্যা হলে

| সমস্যা | সমাধান |
|--------|--------|
| `DATABASE_URL must be set` | `.env.local` ফাইল আছে কিনা দেখো |
| `drizzle-kit push` fail | `.env.local` এ DATABASE_URL আছে কিনা দেখো |
| Books দেখাচ্ছে না | `npm run db:push` run করো |
| Clerk warning | Clerk keys বসাও (ধাপ ২ দেখো) |
