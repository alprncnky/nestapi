#!/bin/bash

# OYAK Yatırım Web Scraper - Test Script
# This script tests the OYAK scraper endpoint and displays formatted results

echo "================================================"
echo "OYAK Yatırım Web Scraper - Test Script"
echo "================================================"
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s http://localhost:3000/api/v1/stock-prices/getall > /dev/null 2>&1; then
    echo "❌ Server is not running!"
    echo ""
    echo "Please start the server first:"
    echo "  npm run start:dev"
    echo ""
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test the OYAK scraper endpoint
echo "📡 Fetching data from OYAK Yatırım..."
echo ""

response=$(curl -s http://localhost:3000/api/v1/stock-prices/test-oyak-scraper)

if [ $? -ne 0 ]; then
    echo "❌ Failed to fetch data from endpoint"
    exit 1
fi

# Display formatted response
echo "================================================"
echo "Response Summary"
echo "================================================"
echo ""

# Extract and display key information using jq if available
if command -v jq &> /dev/null; then
    echo "📊 Total Stocks: $(echo $response | jq -r '.data.totalStocks')"
    echo "🕒 Scraped At: $(echo $response | jq -r '.data.scrapedAt')"
    echo "🌐 Source: $(echo $response | jq -r '.data.source')"
    echo ""
    echo "================================================"
    echo "Sample Data (First 5 Stocks)"
    echo "================================================"
    echo ""
    echo $response | jq -r '.data.sample[] | "Symbol: \(.symbol)\nName: \(.name)\nPrice: \(.price)\nDaily Change: \(.dailyChange)\nVolume: \(.volume)\n---"'
    echo ""
    echo "================================================"
    echo "✅ Test completed successfully!"
    echo "================================================"
    echo ""
    echo "📄 Full response saved to: oyak-scraper-response.json"
    echo $response | jq '.' > oyak-scraper-response.json
else
    # Fallback without jq
    echo "Full Response:"
    echo $response | python3 -m json.tool 2>/dev/null || echo $response
    echo ""
    echo "================================================"
    echo "✅ Test completed!"
    echo "================================================"
    echo ""
    echo "💡 Tip: Install 'jq' for better formatted output:"
    echo "   brew install jq  (macOS)"
    echo "   apt-get install jq  (Linux)"
fi

echo ""
echo "📚 Documentation:"
echo "   - Usage Guide: docs/oyak-scraper-usage.md"
echo "   - Summary: docs/OYAK-SCRAPER-SUMMARY.md"
echo ""

