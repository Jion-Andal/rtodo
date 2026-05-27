#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "iOS release builds require macOS with Xcode installed."
  exit 1
fi

if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild not found. Install Xcode from the Mac App Store."
  exit 1
fi

npm run cap:sync

IOS_DIR="$ROOT/ios/App"
ARCHIVE_PATH="$IOS_DIR/build/App.xcarchive"
EXPORT_PATH="$IOS_DIR/build/export"
EXPORT_PLIST="$ROOT/scripts/ExportOptions.plist"

rm -rf "$IOS_DIR/build"
mkdir -p "$IOS_DIR/build"

xcodebuild \
  -project "$IOS_DIR/App.xcodeproj" \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE_PATH" \
  archive

xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_PLIST"

IPA_PATH="$(find "$EXPORT_PATH" -maxdepth 1 -name '*.ipa' | head -n 1)"
if [[ -z "$IPA_PATH" ]]; then
  echo "Export finished but no IPA was found in $EXPORT_PATH"
  exit 1
fi

echo
echo "Release IPA: $IPA_PATH"
