#!/bin/bash

# Setup HTTPS certificates for local development
# This fixes the "origins don't match" error with Coinbase Smart Wallet

echo "🔐 Setting up HTTPS for local development..."
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "📦 mkcert is not installed. Installing..."
    echo ""
    
    # Detect OS and install mkcert
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        brew install mkcert
        brew install nss # for Firefox support
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt install libnss3-tools
        curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
        chmod +x mkcert-v*-linux-amd64
        sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    else
        echo "❌ Unsupported OS. Please install mkcert manually:"
        echo "   https://github.com/FiloSottile/mkcert#installation"
        exit 1
    fi
fi

# Install the local CA
echo "📜 Installing local Certificate Authority..."
mkcert -install

# Create certs directory
mkdir -p certs

# Generate certificate for localhost
echo "🔑 Generating SSL certificate for localhost..."
cd certs
mkcert localhost 127.0.0.1 ::1
mv localhost+2.pem localhost.pem
mv localhost+2-key.pem localhost-key.pem
cd ..

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: npm run dev:https"
echo "   2. Open: https://localhost:3001"
echo "   3. Your browser will trust the certificate automatically"
echo ""
echo "🎉 Coinbase Smart Wallet origin error should now be fixed!"



