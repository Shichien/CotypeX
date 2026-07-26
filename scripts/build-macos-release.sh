#!/bin/bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
cd "$ROOT"

for command in npm cargo rustup lipo ditto shasum; do
  command -v "$command" >/dev/null 2>&1 || {
    printf 'Required command is missing: %s\n' "$command" >&2
    exit 1
  }
done

[ "$(uname -s)" = "Darwin" ] || {
  printf 'This release script must run on macOS.\n' >&2
  exit 1
}

VERSION="$(awk -F'"' '/^version = "/ { print $2; exit }' Cargo.toml)"
[ -n "$VERSION" ] || {
  printf 'Could not read the package version from Cargo.toml.\n' >&2
  exit 1
}

PACKAGE_NAME="CoTypeX-${VERSION}-macos-universal"
PACKAGE="$ROOT/release/$PACKAGE_NAME"
ARCHIVE="$ROOT/release/${PACKAGE_NAME}.zip"
[ ! -e "$PACKAGE" ] || {
  printf 'Release directory already exists: %s\n' "$PACKAGE" >&2
  exit 1
}
[ ! -e "$ARCHIVE" ] || {
  printf 'Release archive already exists: %s\n' "$ARCHIVE" >&2
  exit 1
}

npm --prefix web ci
npm --prefix web test
npm --prefix web run build
cargo test --all-targets
cargo clippy --all-targets -- -D warnings

rustup target add aarch64-apple-darwin x86_64-apple-darwin
cargo build --release --target aarch64-apple-darwin
cargo build --release --target x86_64-apple-darwin

mkdir -p "$ROOT/release"
mkdir "$PACKAGE"
lipo -create \
  "$ROOT/target/aarch64-apple-darwin/release/cotypex" \
  "$ROOT/target/x86_64-apple-darwin/release/cotypex" \
  -output "$PACKAGE/cotypex"
chmod 755 "$PACKAGE/cotypex"
cp "$ROOT/dist/cotypex.user.js" "$PACKAGE/cotypex.user.js"
cp "$ROOT/macos/Start CoTypeX.command" "$PACKAGE/Start CoTypeX.command"
chmod 755 "$PACKAGE/Start CoTypeX.command"
cp "$ROOT/macos/README.md" "$PACKAGE/README.md"
cp "$ROOT/LICENSE" "$PACKAGE/LICENSE"

lipo -verify_arch arm64 x86_64 "$PACKAGE/cotypex"
(
  cd "$PACKAGE"
  shasum -a 256 cotypex cotypex.user.js "Start CoTypeX.command" README.md LICENSE > SHA256SUMS.txt
)
ditto -c -k --sequesterRsrc --keepParent "$PACKAGE" "$ARCHIVE"

printf 'Built %s\n' "$ARCHIVE"
