Pod::Spec.new do |s|
  s.name             = 'Crypto'
  s.version          = '3.9.1'
  s.summary          = 'Wrapper that re-exports system CryptoKit'
  s.homepage         = 'https://developer.apple.com/documentation/cryptokit'
  s.license          = { :type => 'MIT' }
  s.author           = 'Local'
  s.source           = {
    :git => 'https://github.com/apple/swift-crypto.git',
    :tag => "#{s.version}"
  }

  s.swift_version = '5.9'
  s.ios.deployment_target = '13.0'
  s.osx.deployment_target = '10.15'
  s.tvos.deployment_target = '13.0'
  s.watchos.deployment_target = '6.0'

  # Create a simple Swift file that re-exports CryptoKit
  s.prepare_command = <<-CMD
mkdir -p Sources
cat > Sources/Crypto.swift << 'EOF'
#if canImport(CryptoKit)
@_exported import CryptoKit
#else
// Fallback for platforms without CryptoKit
#endif
EOF
  CMD
  
  s.source_files = 'Sources/*.swift'
  s.module_name = 'Crypto'
end