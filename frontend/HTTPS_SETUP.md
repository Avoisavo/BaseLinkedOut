# HTTPS Local Development Setup

## Why HTTPS is Required

When using **Coinbase Smart Wallet** (Base Account SDK), you may encounter this error:

```
origins don't match "https://keys.coinbase.com" "http://localhost:3001"
```

This happens because:
- Coinbase's key management service (`keys.coinbase.com`) runs on HTTPS
- Your local app runs on HTTP by default
- Browsers block mixed content (HTTPS → HTTP communication) for security
- The Coinbase Wallet extension enforces strict origin matching

## Solution: Run Your App on HTTPS Locally

### Quick Setup (Recommended)

1. **Run the setup script:**
   ```bash
   npm run setup-https
   ```
   
   This will:
   - Install `mkcert` (a tool for creating locally-trusted SSL certificates)
   - Generate SSL certificates for localhost
   - Set up a local Certificate Authority

2. **Start the development server with HTTPS:**
   ```bash
   npm run dev:https
   ```

3. **Open your app:**
   ```
   https://localhost:3001
   ```
   
   Your browser will automatically trust the certificate! 🎉

### Manual Setup (Alternative)

If the script doesn't work, you can set up HTTPS manually:

#### macOS/Linux:

```bash
# Install mkcert
# macOS:
brew install mkcert
brew install nss  # for Firefox

# Linux:
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Install the local CA
mkcert -install

# Generate certificate
cd frontend
mkdir -p certs
cd certs
mkcert localhost 127.0.0.1 ::1
mv localhost+2.pem localhost.pem
mv localhost+2-key.pem localhost-key.pem
cd ..

# Run with HTTPS
npm run dev:https
```

#### Windows:

```powershell
# Install mkcert using Chocolatey
choco install mkcert

# Install the local CA
mkcert -install

# Generate certificate
cd frontend
mkdir certs
cd certs
mkcert localhost 127.0.0.1 ::1
ren localhost+2.pem localhost.pem
ren localhost+2-key.pem localhost-key.pem
cd ..

# Run with HTTPS
npm run dev:https
```

## How It Works

1. **mkcert** creates a local Certificate Authority (CA) and installs it in your system's trust store
2. It generates SSL certificates signed by this CA for `localhost`
3. The custom `server.js` uses these certificates to run Next.js over HTTPS
4. Your browser trusts the certificates automatically (no security warnings!)
5. Coinbase Smart Wallet can now communicate properly with your app

## Troubleshooting

### Certificate not trusted?

If you see a security warning:
```bash
mkcert -install
```

Then restart your browser.

### Port already in use?

If port 3001 is busy, edit `server.js` and change the port:
```javascript
const port = 3002; // or any other port
```

### Still getting origin errors?

1. Make sure you're accessing via `https://` (not `http://`)
2. Check that certificates are in `./certs/` directory
3. Restart the dev server
4. Clear browser cache and reload

### Want to use regular HTTP?

You can still use the regular dev command, but Coinbase Smart Wallet may not work:
```bash
npm run dev
```

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run setup-https` | One-time setup: installs mkcert and generates certificates |
| `npm run dev:https` | Start dev server with HTTPS (recommended for Coinbase) |
| `npm run dev` | Start dev server with HTTP (Coinbase may not work) |

## Security Notes

- ✅ Certificates are only trusted on your local machine
- ✅ They're automatically excluded from git (in `.gitignore`)
- ✅ They expire after a certain period and can be regenerated
- ✅ Safe for local development only - **never use in production**

## Production

In production, your hosting provider (Vercel, Netlify, etc.) automatically provides HTTPS certificates. No setup needed! This is only for local development.

---

**Need help?** Check out:
- [mkcert documentation](https://github.com/FiloSottile/mkcert)
- [Base Account SDK docs](https://docs.base.org/base-account)



